import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/auth";
import { useRef, useState } from "react";
import { Camera, Images, SwitchCamera, X } from "lucide-react-native";
import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DataAnalysis, FoodAnalysis } from "@/types/ai";
import { ThemedText } from "@/components/ThemedText";

export default function Index() {
  const { isLoading, user, fetchWithAuth, signOut } = useAuth();

  const [permissionCamera, requestPermissionCamera] = useCameraPermissions();
  const [permissionLibrary, requestPermissionLibrary] =
    ImagePicker.useMediaLibraryPermissions();

  const [facing, setFacing] = useState<CameraType>("back");
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
        setPictureData({
          base64: result.assets[0].base64!,
          uri: result.assets[0].uri,
        });
        setCameraOn(false);
      }
    } else {
      requestPermissionLibrary();
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
      console.log(JSON.stringify(data.foodAnalysis, null, 4));
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

  if (!permissionCamera) {
    return <View />;
  }

  if (!permissionCamera.granted) {
    return (
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 10 }}>
        <ThemedText
          fontFamily="bold"
          style={{
            fontSize: 40,
            alignSelf: "flex-start",
          }}
        >
          CalAi
        </ThemedText>
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
          <Pressable
            style={[styles.button, { width: "100%" }]}
            onPress={requestPermissionCamera}
          >
            <ThemedText fontFamily="bold" style={{ color: "#fff" }}>
              Allow
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
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
          <TouchableOpacity style={styles.buttonImages} onPress={pickImage}>
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
          <ThemedText
            fontFamily="bold"
            style={{
              fontSize: 40,
            }}
          >
            CalAi
          </ThemedText>
          {user && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <TouchableOpacity onPress={() => setShow((c) => !c)}>
                <Image
                  source={{ uri: user.picture }}
                  style={{ width: 30, height: 30, borderRadius: 100 }}
                />
              </TouchableOpacity>
              {show && (
                <TouchableOpacity onPress={signOut}>
                  <ThemedText fontFamily="bold" style={{ fontSize: 14 }}>
                    Logout
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <ThemedText style={{ fontSize: 18 }}>
          Analyze your food and get detailed nutritional information
        </ThemedText>
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
                  <ThemedText fontFamily="bold" style={{ fontSize: 18 }}>
                    Analyzing
                  </ThemedText>
                  <ActivityIndicator color="#000" />
                </View>
              ) : foodAnalysis ? (
                <View style={{ flexDirection: "column" }}>
                  <ThemedText fontFamily="bold" style={{ fontSize: 18 }}>
                    Description
                  </ThemedText>
                  <ThemedText style={{ fontSize: 16 }}>
                    {foodAnalysis.identifiedFood}
                  </ThemedText>
                  <ThemedText
                    fontFamily="bold"
                    style={{ fontSize: 18, marginTop: 10 }}
                  >
                    Nutrientes por porcion
                  </ThemedText>
                  <FlatList
                    data={[
                      {
                        title: "Protein",
                        value: foodAnalysis.nutritionFactsPerPortion.protein,
                      },
                      {
                        title: "Calories",
                        value: foodAnalysis.nutritionFactsPerPortion.calories,
                      },
                      {
                        title: "Carbs",
                        value: foodAnalysis.nutritionFactsPerPortion.carbs,
                      },
                      {
                        title: "Fat",
                        value: foodAnalysis.nutritionFactsPerPortion.fat,
                      },
                      {
                        title: "Fiber",
                        value: foodAnalysis.nutritionFactsPerPortion.fiber,
                      },
                      {
                        title: "Sodium",
                        value: foodAnalysis.nutritionFactsPerPortion.sodium,
                      },
                      {
                        title: "Cholesterol",
                        value:
                          foodAnalysis.nutritionFactsPerPortion.cholesterol,
                      },
                    ]}
                    renderItem={({ item }) => (
                      <View
                        key={item.title}
                        style={{
                          flexDirection: "column",
                          backgroundColor: "white",
                          padding: 10,
                          marginVertical: 8,
                          borderRadius: 10,

                          // Sombra para iOS
                          shadowColor: "#000",
                          shadowOffset: {
                            width: 0,
                            height: 2,
                          },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,

                          // Sombra para Android
                          elevation: 2,
                        }}
                      >
                        <ThemedText fontFamily="bold" style={{ fontSize: 16 }}>
                          {item.title}
                        </ThemedText>
                        <ThemedText style={{ fontSize: 16 }}>
                          {item.value}
                        </ThemedText>
                      </View>
                    )}
                    keyExtractor={(item) => item.title}
                    horizontal
                    ItemSeparatorComponent={() => (
                      <View style={{ width: 12 }}></View>
                    )}
                    contentContainerStyle={{ marginHorizontal: 2 }}
                  />
                </View>
              ) : error ? (
                <Text>{error}</Text>
              ) : (
                <>
                  <TouchableOpacity
                    style={{ ...styles.button, flex: 1 }}
                    onPress={() => analyzeImage(pictureData.base64)}
                  >
                    <ThemedText
                      fontFamily="bold"
                      style={{
                        fontSize: 18,
                        color: "#fff",
                      }}
                    >
                      Analizy food
                    </ThemedText>
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
                    <ThemedText
                      fontFamily="bold"
                      style={{ fontSize: 18, color: "000" }}
                    >
                      Open camera
                    </ThemedText>
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
              <ThemedText
                fontFamily="bold"
                style={{ fontSize: 18, color: "#fff" }}
              >
                Open camera
              </ThemedText>
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
