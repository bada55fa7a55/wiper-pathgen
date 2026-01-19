import { cva } from 'class-variance-authority';
import type { ComponentProps, ValidComponent } from 'solid-js';
import { splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { twMerge } from 'tailwind-merge';

type ClassValue = string | string[];

/**
 * Create reusable component using Tailwind classes
 * @param element The HTML tag (e.g. "button")
 * @param base The base classes (string or array)
 * @param config The CVA configuration object
 */
export function twc<
  T extends ValidComponent,
  const V extends {
    variants?: Record<string, Record<string, ClassValue | null>>;
    defaultVariants?: Record<string, string>;
  } = Record<string, never>,
>(
  element: T,
  base: ClassValue,
  config?: V & {
    defaultVariants?: V['variants'] extends Record<string, unknown>
      ? { [K in keyof V['variants']]?: keyof V['variants'][K] }
      : never;
  },
) {
  const style = cva(base, config);

  const variantKeys = config?.variants ? Object.keys(config.variants) : [];

  type CvaVariants =
    V['variants'] extends Record<string, unknown>
      ? {
          [K in keyof V['variants']]?: keyof V['variants'][K] | boolean | null | undefined;
        }
      : Record<string, never>;

  type Props = ComponentProps<T> & CvaVariants & { class?: string };

  const intrinsicPropCache = new Map<string, Set<string>>();
  const getIntrinsicPropSet = (tag: string): Set<string> => {
    const cached = intrinsicPropCache.get(tag);
    if (cached) {
      return cached;
    }
    const el = typeof document !== 'undefined' ? document.createElement(tag) : null;
    const props = new Set<string>();
    if (el) {
      for (const key in el) {
        props.add(key);
      }
    }
    intrinsicPropCache.set(tag, props);
    return props;
  };

  const shouldForwardVariant = (key: string): boolean => {
    if (typeof element !== 'string') {
      return false;
    }
    return getIntrinsicPropSet(element).has(key);
  };

  const Component = (props: Props) => {
    const [local, others] = splitProps(props, [...variantKeys, 'class'] as any);

    const forwardedVariants: Record<string, unknown> = {};
    for (const key of variantKeys) {
      if (key in props && shouldForwardVariant(key)) {
        Object.defineProperty(forwardedVariants, key, {
          enumerable: true,
          get: () => (props as any)[key],
        });
      }
    }

    return (
      <Dynamic
        component={element}
        {...(others as any)}
        {...forwardedVariants}
        class={twMerge(style(local), local.class)}
      />
    );
  };

  return Component;
}
