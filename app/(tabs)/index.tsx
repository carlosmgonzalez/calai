import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/auth";
import { useState } from "react";

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
import { router } from "expo-router";
import { useImageStore } from "@/store/useImageStore";

export default function Index() {
  const { isLoading, user, fetchWithAuth } = useAuth();

  const { image, setNullImage } = useImageStore();

  const [foodAnalysis, setFoodAnalysis] = useState<FoodAnalysis | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  interface SaveAnalysisData {
    imageBase64: string;
    identifiedFood: string;
    portionSize: string;
    healthScore: string;
    dietaryInfo: string;
    additionalNotes: string;
    nutritionFactsPerPortion: {
      calories: string;
      protein: string;
      carbs: string;
      fat: string;
      saturatedFat: string;
      transFat: string;
      fiber: string;
      sugar: string;
      sodium: string;
      cholesterol: string;
    };
  }

  const saveAnalysis = async (data: SaveAnalysisData) => {
    setIsSaving(true);
    const { imageBase64, ...restData } = data;
    try {
      const uploadRes = await fetchWithAuth("/api/protected/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64,
        }),
      });

      const result = await uploadRes.json();

      if (result.ok) {
        console.log("Image uploaded successfully!", result.imageUrl);
        // Aquí puedes hacer algo con la URL de la imagen
        await fetchWithAuth("/api/protected/save-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: result.imageUrl,
            ...restData,
          }),
        });
      } else {
        console.error("Upload failed:", result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsSaving(false);
      setIsSaved(true);
    }
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

  return (
    <View style={{ flex: 1, paddingHorizontal: 10 }}>
      <ThemedText style={{ fontSize: 18 }}>
        Analyze your food and get detailed nutritional information
      </ThemedText>
      {image ? (
        <View style={{ flex: 1, marginTop: 10 }}>
          <Image source={{ uri: image.uri }} style={styles.picture} />
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
                  Nutrients per portion
                </ThemedText>
                <FlatList
                  data={[
                    {
                      title: "Protein",
                      value: foodAnalysis.nutritionFactsPerPortion.protein,
                      unit: "grams",
                    },
                    {
                      title: "Calories",
                      value: foodAnalysis.nutritionFactsPerPortion.calories,
                      unit: "kcal",
                    },
                    {
                      title: "Carbs",
                      value: foodAnalysis.nutritionFactsPerPortion.carbs,
                      unit: "grams",
                    },
                    {
                      title: "Fat",
                      value: foodAnalysis.nutritionFactsPerPortion.fat,
                      unit: "grams",
                    },
                    {
                      title: "Fiber",
                      value: foodAnalysis.nutritionFactsPerPortion.fiber,
                      unit: "grams",
                    },
                    {
                      title: "Sodium",
                      value: foodAnalysis.nutritionFactsPerPortion.sodium,
                      unit: "mg",
                    },
                    {
                      title: "Cholesterol",
                      value: foodAnalysis.nutritionFactsPerPortion.cholesterol,
                      unit: "mg",
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
                        {item.value} {item.unit}
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
                <TouchableOpacity
                  style={{ ...styles.secondaryButton }}
                  onPress={() => {
                    setNullImage();
                    setFoodAnalysis(null);
                    setIsSaved(false);
                  }}
                >
                  <ThemedText
                    fontFamily="bold"
                    style={{
                      fontSize: 18,
                    }}
                  >
                    Again
                  </ThemedText>
                </TouchableOpacity>
                {!isSaved && (
                  <TouchableOpacity
                    style={{ ...styles.button }}
                    disabled={isSaving}
                    onPress={() =>
                      saveAnalysis({
                        imageBase64: image.base64,
                        identifiedFood: foodAnalysis.identifiedFood,
                        portionSize: foodAnalysis.portionSize,
                        healthScore: foodAnalysis.healthScore,
                        dietaryInfo: foodAnalysis.dietaryInfo.join("//"),
                        additionalNotes:
                          foodAnalysis.additionalNotes.join("//"),
                        nutritionFactsPerPortion: {
                          calories:
                            foodAnalysis.nutritionFactsPerPortion.calories,
                          carbs: foodAnalysis.nutritionFactsPerPortion.carbs,
                          cholesterol:
                            foodAnalysis.nutritionFactsPerPortion.cholesterol,
                          fat: foodAnalysis.nutritionFactsPerPortion.fat,
                          fiber: foodAnalysis.nutritionFactsPerPortion.fiber,
                          protein:
                            foodAnalysis.nutritionFactsPerPortion.protein,
                          saturatedFat:
                            foodAnalysis.nutritionFactsPerPortion.saturatedFat,
                          sodium: foodAnalysis.nutritionFactsPerPortion.sodium,
                          sugar: foodAnalysis.nutritionFactsPerPortion.sugar,
                          transFat:
                            foodAnalysis.nutritionFactsPerPortion.transFat,
                        },
                      })
                    }
                  >
                    {isSaving ? (
                      <ActivityIndicator />
                    ) : (
                      <ThemedText
                        fontFamily="bold"
                        style={{
                          fontSize: 18,
                          color: "#fff",
                        }}
                      >
                        Save
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ) : error ? (
              <Text>{error}</Text>
            ) : (
              <>
                <TouchableOpacity
                  style={{ ...styles.button, flex: 1 }}
                  onPress={() => analyzeImage(image.base64)}
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
                    router.push("/camera");
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
              router.push("/camera");
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
    </View>
  );
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
  secondaryButton: {
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#fff",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  picture: {
    width: 150,
    height: 150,
    borderRadius: 10,
    alignSelf: "center",
  },
});
