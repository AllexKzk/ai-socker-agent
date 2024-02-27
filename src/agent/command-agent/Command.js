export default function Command(callback, priority = 5) {
  return { callback, priority }
}