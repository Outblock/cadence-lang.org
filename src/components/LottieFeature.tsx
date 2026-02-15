'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

export function LottieFeature({ src }: { src: string }) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    fetch(src)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [src]);

  if (!data) return <div className="w-full aspect-square" />;

  return <Lottie animationData={data} loop />;
}
