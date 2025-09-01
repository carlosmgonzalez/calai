import { Camera, Images, SwitchCamera, X } from "lucide-react-native";
import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useRef, useState } from "react";
import { useImageStore } from "@/store/useImageStore";
import { useRouter } from "expo-router";

export default function CameraPage() {
  const router = useRouter();

  const [permissionCamera, requestPermissionCamera] = useCameraPermissions();
  const [permissionLibrary, requestPermissionLibrary] =
    ImagePicker.useMediaLibraryPermissions();

  const [facing, setFacing] = useState<CameraType>("back");

  const { setImage } = useImageStore();

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const camera = useRef<CameraView>(null);

  const takePicture = async () => {
    const picture = await camera.current!.takePictureAsync({
      base64: true,
    });

    if (picture) {
      setImage({
        base64: picture.base64!,
        uri: picture.uri,
      });
      router.back();
    }
  };

  const pickImage = async () => {
    if (!permissionLibrary) return;

    if (permissionLibrary.granted) {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
        base64: true,
        selectionLimit: 1,
      });

      if (!result.canceled) {
        setImage({
          base64: result.assets[0].base64!,
          uri: result.assets[0].uri,
        });
        router.back();
      }
    } else {
      requestPermissionLibrary();
    }
  };

  if (!permissionCamera) {
    return <View />;
  }

  if (!permissionCamera.granted) {
    return (
      <View style={{ flex: 1, paddingHorizontal: 10 }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ThemedText style={{ textAlign: "center" }}>
            We need your permission to show the camera
          </ThemedText>
          <TouchableOpacity
            style={[styles.button, { width: "100%" }]}
            onPress={requestPermissionCamera}
          >
            <ThemedText fontFamily="bold" style={{ color: "#fff" }}>
              Allow
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
            router.back();
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
        <TouchableOpacity style={styles.buttonImages} onPress={pickImage}>
          <Images color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
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
});
