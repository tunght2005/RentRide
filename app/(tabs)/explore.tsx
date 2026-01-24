import { Image } from "expo-image";
import { Platform, StyleSheet, View } from "react-native";

import { Collapsible } from "@/components/ui/collapsible";
import { ExternalLink } from "@/components/external-link";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <View className="bg-red-500 p-4 rounded-xl mb-6">
        <ThemedText className="text-white text-lg font-bold text-center">
          TAILWIND TEST OK
        </ThemedText>
      </View>

      {/* Title */}
      <ThemedView className="flex-row gap-2 mb-2">
        <ThemedText
          type="title"
          className="text-2xl text-blue-600"
          style={{ fontFamily: Fonts.rounded }}
        >
          Explore
        </ThemedText>
      </ThemedView>

      <ThemedText className="text-gray-600 mb-4">
        This app includes example code to help you get started.
      </ThemedText>

      <Collapsible title="File-based routing">
        <ThemedText className="text-gray-700">
          This app has two screens:{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          and{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>

        <ThemedText className="mt-2 text-gray-700">
          The layout file in{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{" "}
          sets up the tab navigator.
        </ThemedText>

        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link" className="mt-2">
            Learn more
          </ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Android, iOS, and web support">
        <ThemedText className="text-gray-700">
          You can open this project on Android, iOS, and the web. To open the
          web version, press <ThemedText type="defaultSemiBold">w</ThemedText>{" "}
          in the terminal.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Images">
        <ThemedText className="text-gray-700 mb-2">
          For static images, you can use the{" "}
          <ThemedText type="defaultSemiBold">@2x</ThemedText> and{" "}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes.
        </ThemedText>

        {/* ✅ Image dùng Tailwind */}
        <Image
          source={require("@/assets/images/react-logo.png")}
          className="w-24 h-24 self-center my-4"
        />

        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Light and dark mode components">
        <ThemedText className="text-gray-700">
          This template has light and dark mode support. The{" "}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook
          lets you inspect the current color scheme.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Animations">
        <ThemedText className="text-gray-700">
          The{" "}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{" "}
          library is used for animations.
        </ThemedText>

        {Platform.select({
          ios: (
            <ThemedText className="mt-2 text-gray-700">
              The ParallaxScrollView component provides a parallax effect.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
});
