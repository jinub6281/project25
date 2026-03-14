"use client";

import { useEffect, useState, use } from "react";

export default function FilePreview({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  // 🔥 params unwrap
  const { name } = use(params);

  const [content, setContent] = useState<string | null>(null);

  const isText = name.match(/\.(txt|md|json|php|js)$/i);

  useEffect(() => {
    if (isText) {
      fetch(`/api/file-content?name=${name}`)
        .then((res) => res.json())
        .then((data) => setContent(data.content));
    }
  }, [name]);

  if (isText && content !== null) {
    return (
      <div className="max-w-4xl mx-auto p-10">
        <pre className="bg-[#161b22] p-6 rounded-xl text-sm overflow-x-auto whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    );
  }

  return (
    <iframe
      src={`/uploads/${name}`}
      className="w-full h-screen"
    />
  );
}