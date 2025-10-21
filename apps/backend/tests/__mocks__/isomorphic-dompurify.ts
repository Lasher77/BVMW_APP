export default function createDOMPurify() {
  return {
    sanitize(value: string) {
      return value;
    },
  };
}
