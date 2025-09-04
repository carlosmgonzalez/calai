import { ThemedText } from "@/components/ThemedText";
import { DatePicker } from "@/components/ui/date-picker";
import { useAuth } from "@/context/auth";
import type { FoodAnalysisRecord } from "@/lib/db/types/food-analysis";
import { Redirect } from "expo-router";
import {
  Beef,
  Candy,
  Clock,
  Hamburger,
  SaveOff,
  Utensils,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  View,
  StyleSheet,
} from "react-native";

export default function RecordPage() {
  const { user, fetchWithAuth } = useAuth();
  const [foodAnalysis, setFoodAnalysis] = useState<FoodAnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const getRecord = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = "/api/protected/get-analysis";

      if (selectedDate) {
        const dateString = selectedDate.toISOString().split("T")[0];
        url += `?date=${dateString}`;
      }

      const res = await fetchWithAuth(url, {
        method: "GET",
      });

      const data = (await res.json()) as FoodAnalysisRecord[];
      setFoodAnalysis(data);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth, selectedDate]);

  useEffect(() => {
    getRecord();
  }, [getRecord]);

  if (!user) {
    return <Redirect href="/" />;
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 10 }}>
      <DatePicker
        label="Select Date"
        value={selectedDate}
        onChange={setSelectedDate}
        mode="date"
        placeholder="Choose a date"
        style={{ marginBottom: 10 }}
      />
      {foodAnalysis.length > 0 ? (
        <ThemedText
          style={{
            fontSize: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#e6e6e6",
            paddingBottom: 10,
            marginBottom: 10,
          }}
        >
          Total calories{" "}
          {foodAnalysis.reduce((acc, curr) => {
            acc += Number(curr.nutritionFactsPerPortion?.calories || "0");
            return acc;
          }, 0)}{" "}
          kcal
        </ThemedText>
      ) : (
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          <SaveOff size={40} />
          <ThemedText style={{ fontSize: 30 }}>There are no records</ThemedText>
        </View>
      )}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={getRecord} />
        }
      >
        {foodAnalysis.map((data) => (
          <View
            key={data.id}
            style={{
              flexDirection: "row",
              marginBottom: 10,
              gap: 10,
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: "#e6e6e6",
              paddingBottom: 10,
            }}
          >
            <Image
              source={{ uri: data.imageUrl }}
              style={{ width: 130, height: 130, borderRadius: 10 }}
            />
            <View style={{ flexDirection: "column", gap: 5 }}>
              <View style={styles.rowContainer}>
                <Clock size={20} />
                <ThemedText>
                  {new Date(data.createdAt)
                    .toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                    .toLowerCase()}
                </ThemedText>
              </View>
              <View style={styles.rowContainer}>
                <Utensils size={20} />
                <ThemedText>
                  {data.nutritionFactsPerPortion?.calories} kcal
                </ThemedText>
              </View>
              <View style={styles.rowContainer}>
                <Beef size={20} />
                <ThemedText>
                  {data.nutritionFactsPerPortion?.protein} grams
                </ThemedText>
              </View>
              <View style={styles.rowContainer}>
                <Hamburger size={20} />
                <ThemedText>
                  {data.nutritionFactsPerPortion?.fat} grams
                </ThemedText>
              </View>
              <View style={styles.rowContainer}>
                <Candy size={20} />
                <ThemedText>
                  {data.nutritionFactsPerPortion?.sugar} mg
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
});
