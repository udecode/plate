import { ref } from 'vue';

const isHighContrastMode = ref(false);

export function useHighContrastMode() {
  const setHighContrastMode = (value) => {
    isHighContrastMode.value = value;
  };

  return {
    isHighContrastMode,
    setHighContrastMode,
  };
}
