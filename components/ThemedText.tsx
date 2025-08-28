import { Text, TextProps } from "react-native";

type ThemedTextProps = TextProps & {
  fontFamily?: "regular" | "bold";
};

export const ThemedText = ({ fontFamily, style, ...rest }: ThemedTextProps) => {
  let font = "Quicksand-Regular";

  switch (fontFamily) {
    case "regular":
      font = "Quicksand-Regular";
      break;
    case "bold":
      font = "Quicksand-Bold";
      break;
  }

  return <Text style={[{ fontFamily: font }, style]} {...rest} />;
};
