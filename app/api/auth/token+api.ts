import {
  COOKIE_MAX_AGE,
  COOKIE_NAME,
  COOKIE_OPTIONS,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  JWT_EXPIRATION_TIME,
  JWT_SECRET,
} from "@/utils/constants";
import * as jose from "jose";

type AccessToken = {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
};

export async function POST(request: Request) {
  const body = await request.formData();
  const code = (body as any).get("code") as string;
  const platform = ((body as any).get("platform") as string) || "native";

  if (!code) {
    return Response.json({ error: "Missing auth code" }, { status: 400 });
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
      code,
    }),
  });

  const data = await response.json();

  if (!data.id_token) {
    return Response.json(
      { error: "Id token was not recieved" },
      { status: 400 },
    );
  }

  // We have the id token:
  const userInfo = jose.decodeJwt(data.id_token) as AccessToken;
  const { exp, ...userInfoWithoutExp } = userInfo;

  // User id
  const sub = userInfo.sub;

  // Current timestamp in seconds
  const issuedAt = Math.floor(Date.now() / 1000);

  // Create access token
  const accessToken = await new jose.SignJWT(userInfoWithoutExp)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRATION_TIME)
    .setSubject(sub)
    .setIssuedAt(issuedAt)
    .sign(new TextEncoder().encode(JWT_SECRET));

  if (platform === "web") {
    console.log("hello web");

    const res = Response.json({
      success: true,
      issuedAt,
      expiresAt: issuedAt + COOKIE_MAX_AGE,
    });

    // Set the access token in an HTTP-only cookie:
    res.headers.set(
      "Set-Cookie",
      `${COOKIE_NAME}=${accessToken}; Max-Age=${COOKIE_OPTIONS.maxAge}; Path=${
        COOKIE_OPTIONS.path
      }; ${COOKIE_OPTIONS.httpOnly ? "HttpOnly;" : ""} ${
        COOKIE_OPTIONS.secure ? "Secure;" : ""
      } SameSite=${COOKIE_OPTIONS.sameSite}`,
    );

    return res;
  }

  return Response.json({ access_token: accessToken });
}
