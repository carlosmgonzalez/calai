import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/auth";
import { useRef, useState } from "react";
import { Camera, Images, SwitchCamera, X } from "lucide-react-native";
import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DataAnalysis, FoodAnalysis } from "@/types/ai";

export default function Index() {
  const { isLoading, user, fetchWithAuth, signOut } = useAuth();
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOn, setCameraOn] = useState(false);
  const [pictureData, setPictureData] = useState<{
    base64: string;
    uri: string;
  } | null>(null);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const camera = useRef<CameraView>(null);

  const takePicture = async () => {
    const picture = await camera.current!.takePictureAsync({
      base64: true,
    });

    if (picture) {
      setPictureData({
        base64: picture.base64!,
        uri: picture.uri,
      });

      setCameraOn(false);
    }
  };

  const [foodAnalysis, setFoodAnalysis] = useState<FoodAnalysis | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (imageBase64: string) => {
    setIsAnalysing(true);
    try {
      const response = await fetchWithAuth("/api/protected/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64,
        }),
      });

      const data: DataAnalysis = await response.json();
      setFoodAnalysis(data.foodAnalysis);
    } catch (err) {
      console.error(err);
      setError("Something went wrong try later");
    } finally {
      setIsAnalysing(false);
    }
  };

  const [show, setShow] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.button}>Grant permits</Text>
        </Pressable>
      </View>
    );
  }

  if (cameraOn) {
    return (
      <View style={styles.container}>
        <CameraView
          ref={camera}
          style={styles.camera}
          facing={facing}
          ratio="4:3"
          mirror={true}
        />
        <View style={{ position: "absolute", top: 40, left: 20 }}>
          <TouchableOpacity
            style={styles.buttonFacing}
            onPress={() => {
              setCameraOn(false);
            }}
          >
            <X color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.buttonFacing}
            onPress={toggleCameraFacing}
          >
            <SwitchCamera color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonTake} onPress={takePicture}>
            <Camera color="#fff" size={36} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonImages} onPress={takePicture}>
            <Images color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  } else {
    return (
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 10 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              ...styles.textBold,
              fontSize: 40,
            }}
          >
            CalAi
          </Text>
          {user && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <TouchableOpacity onPress={() => setShow((c) => !c)}>
                <Image
                  source={{ uri: user.picture }}
                  style={{ width: 30, height: 30, borderRadius: 100 }}
                />
              </TouchableOpacity>
              {show && (
                <TouchableOpacity onPress={signOut}>
                  <Text style={{ ...styles.textBold, fontSize: 14 }}>
                    Logout
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <Text style={{ ...styles.textRegular, fontSize: 20 }}>
          Analyze your food and get detailed nutritional information
        </Text>
        {pictureData ? (
          <View style={{ flex: 1 }}>
            <Image source={{ uri: pictureData.uri }} style={styles.picture} />
            <View
              style={{ flexDirection: "row", gap: 5, justifyContent: "center" }}
            >
              {isAnalysing ? (
                <View
                  style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
                >
                  <Text style={{ ...styles.textBold, fontSize: 18 }}>
                    Analyzing
                  </Text>
                  <ActivityIndicator color="#000" />
                </View>
              ) : foodAnalysis ? (
                <View style={{ flexDirection: "column" }}>
                  <Text style={{ ...styles.textBold, fontSize: 18 }}>
                    Description
                  </Text>
                  <Text style={{ ...styles.textRegular, fontSize: 16 }}>
                    {foodAnalysis.identifiedFood}
                  </Text>
                </View>
              ) : error ? (
                <Text>{error}</Text>
              ) : (
                <>
                  <TouchableOpacity
                    style={{ ...styles.button, flex: 1 }}
                    onPress={() => analyzeImage(pictureData.base64)}
                  >
                    <Text
                      style={{
                        ...styles.textBold,
                        fontSize: 18,
                        color: "#fff",
                      }}
                    >
                      Analizy food
                    </Text>
                  </TouchableOpacity>
                  <Pressable
                    style={{
                      ...styles.button,
                      flex: 1,
                      backgroundColor: "#cfcfcf",
                    }}
                    onPress={() => {
                      setCameraOn(true);
                    }}
                  >
                    <Text
                      style={{ ...styles.textBold, fontSize: 18, color: "000" }}
                    >
                      Open camera
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Pressable
              style={styles.button}
              onPress={() => {
                setCameraOn(true);
              }}
            >
              <Text style={{ ...styles.textBold, fontSize: 18, color: "#fff" }}>
                Open camera
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  textBold: {
    fontFamily: "Quicksand-Bold",
  },
  textRegular: {
    fontFamily: "Quicksand-Regular",
  },
  signOutButton: {
    padding: 5,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#F15D0E",
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#000",
    marginTop: 10,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 60,
    flexDirection: "row",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 25,
  },
  buttonFacing: {
    backgroundColor: "#8a8a8a",
    padding: 14,
    borderRadius: 100,
  },
  buttonTake: {
    backgroundColor: "#8a8a8a",
    padding: 20,
    borderRadius: 100,
  },
  buttonImages: {
    backgroundColor: "#8a8a8a",
    padding: 14,
    borderRadius: 100,
  },
  picture: {
    width: 150,
    height: 150,
    borderRadius: 10,
    alignSelf: "center",
  },
});
