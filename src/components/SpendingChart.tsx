import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type SpendingCategory = {
  name: string;
  amount: number;
  color: string;
};

type SpendingChartProps = {
  data: SpendingCategory[];
  size?: number;
  type: 'pie' | 'line';
};

export default function SpendingChart({ data, size = 220, type = 'pie' }: SpendingChartProps) {
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: type === 'pie' ? 0 : 1,
      duration: 400,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [type]);

  const animatedStyle = {
    opacity: animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.4, 1],
    }),
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.96, 1],
        }),
      },
    ],
  };

  const total = data.reduce(
    (sum, category) => sum + category.amount,
    0,
  );

  let accumulatedLength = 0;

  const segments = data.map((category) => {
    const percentage =
      total > 0 ? category.amount / total : 0;

    const segmentLength = percentage * circumference;

    const segment = {
      ...category,
      percentage,
      strokeDasharray: `${segmentLength} ${circumference - segmentLength}`,
      strokeDashoffset: -accumulatedLength,
    };

    accumulatedLength += segmentLength;

    return segment;
  });

  if (type === 'pie') {
    return (
      <Animated.View
        style={[
          styles.container,
          { width: size, height: size },
          animatedStyle,
        ]}
      >
        <Svg width={size} height={size}>
          {/* Background ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#252B38"
            strokeWidth={strokeWidth}
          />

          {segments.map((segment) => (
            <Circle
              key={segment.name}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={segment.strokeDasharray}
              strokeDashoffset={segment.strokeDashoffset}
              strokeLinecap="butt"
            />
          ))}
        </Svg>
      </Animated.View>
    );
  }
  if (type === 'line') {
    return (
      <Animated.View style={[styles.lineContainer, animatedStyle]}>
        {data.map((category) => {
          const percentage =
            total > 0 ? category.amount / total : 0;

          return (
            <View
              key={category.name}
              style={[
                styles.segment,
                {
                  flex: percentage,
                  backgroundColor: category.color,
                },
              ]}
            />
          );
        })}
      </Animated.View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },

  lineContainer: {
    width: '100%',
    height: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#252B38',
    alignSelf: 'stretch'
  },

  segment: {
    height: '100%',
  },
});