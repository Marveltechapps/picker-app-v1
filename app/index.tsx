import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    try {
      router.replace("/splash");
    } catch (_) {}
  }, [router]);

  return null;
}

