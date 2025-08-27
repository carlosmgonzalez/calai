import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/auth";
import { useRef, useState } from "react";
import { Camera, Images, SwitchCamera } from "lucide-react-native";
import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";

import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const { isLoading, user, signOut, fetchWithAuth } = useAuth();
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOn, setCameraOn] = useState(true);
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

  const analyzeImage = async (imageBase64: string) => {
    const response = await fetchWithAuth("/api/protected/analyze-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageBase64,
      }),
    });

    const data = await response.json();

    console.log(data);
  };

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
        <Pressable style={styles.buttonAnalyze} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant permits</Text>
        </Pressable>
      </View>
    );
  }

  if (cameraOn) {
    return (
      <View style={styles.container}>
        <CameraView ref={camera} style={styles.camera} facing={facing} />
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
      <View style={styles.container}>
        {pictureData ? (
          <>
            <Image source={{ uri: pictureData.uri }} style={styles.picture} />
            <Pressable
              style={styles.buttonAnalyze}
              onPress={() => analyzeImage(pictureData.base64)}
            >
              <Text style={styles.buttonText}>Analizy Image</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={styles.buttonAnalyze}
            onPress={() => {
              setCameraOn(true);
            }}
          >
            <Text style={styles.buttonText}>Open camera</Text>
          </Pressable>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
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
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  buttonAnalyze: {
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#186927",
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
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  picture: {
    width: 200,
    height: 300,
    borderRadius: 10,
  },
});
