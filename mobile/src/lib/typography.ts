import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';

/**
 * Map a React Native fontWeight to the matching loaded Inter font family.
 *
 * On Android a static font family ignores `fontWeight`, so bold text would
 * render at regular weight unless we pick the correct weighted Inter file.
 */
export function interForWeight(weight?: string | number | null): string {
  const w = weight == null ? '400' : String(weight);
  switch (w) {
    case '100':
    case '200':
    case '300':
    case '400':
    case 'normal':
      return 'Inter_400Regular';
    case '500':
      return 'Inter_500Medium';
    case '600':
      return 'Inter_600SemiBold';
    case '700':
    case 'bold':
      return 'Inter_700Bold';
    case '800':
    case '900':
      return 'Inter_800ExtraBold';
    default:
      return 'Inter_400Regular';
  }
}

/**
 * Apply Inter globally to every <Text> once, matching the web UI theme.
 *
 * We patch Text's render so each instance gets the Inter family that
 * corresponds to its resolved fontWeight. The injected fontFamily is placed
 * first so any explicit `fontFamily` in a component's own style still wins.
 * A defaultProps fallback is used if render patching is unavailable.
 */
export function applyInterToText(): void {
  const TextAny = RNText as any;
  if (TextAny.__interPatched) return;

  const originalRender = TextAny.render;
  if (typeof originalRender === 'function') {
    TextAny.render = function patchedRender(...args: any[]) {
      const element = originalRender.apply(this, args);
      if (!element || !React.isValidElement(element)) return element;
      const flat = StyleSheet.flatten((element.props as any).style) || {};
      const family = interForWeight((flat as any).fontWeight);
      return React.cloneElement(element as any, {
        style: [{ fontFamily: family }, (element.props as any).style],
      });
    };
  } else {
    TextAny.defaultProps = TextAny.defaultProps || {};
    TextAny.defaultProps.style = [
      { fontFamily: 'Inter_400Regular' },
      TextAny.defaultProps.style,
    ];
  }

  TextAny.__interPatched = true;
}
