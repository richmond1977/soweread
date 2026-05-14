"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { ImageUp, Loader2, Scissors, X } from "lucide-react";

type CoverImageFieldProps = {
  defaultValue?: string;
};

const COVER_WIDTH = 1200;
const COVER_HEIGHT = 630;

export function CoverImageField({ defaultValue }: CoverImageFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceName, setSourceName] = useState("cover.jpg");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  const previewStyle = useMemo(
    () => ({
      transform: `translate(${offsetX}%, ${offsetY}%) scale(${zoom})`,
    }),
    [offsetX, offsetY, zoom]
  );

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("請選擇圖片檔案。");
      return;
    }

    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceName(file.name.replace(/\.[^.]+$/, "") || "cover");
    setSourceUrl(URL.createObjectURL(file));
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  }

  async function uploadCroppedCover() {
    if (!sourceUrl) return;
    setIsUploading(true);
    setError("");

    try {
      const blob = await cropToBlob(sourceUrl, zoom, offsetX, offsetY);
      const formData = new FormData();
      formData.append("file", new File([blob], `${sourceName}-cover.jpg`, { type: "image/jpeg" }));

      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const json = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !json.url) {
        throw new Error(json.error || "封面上傳失敗。");
      }

      setValue(json.url);
      setSourceUrl("");
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "封面上傳失敗。";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="cover-field">
      <input type="hidden" name="coverImage" value={value} readOnly />
      <div className="cover-field__header">
        <div>
          <p className="cover-field__title">封面圖片</p>
          <p className="cover-field__hint">建議裁切為 1200 x 630，適合文章卡片與社群分享。</p>
        </div>
        <label className="admin-icon-button">
          <ImageUp size={16} aria-hidden="true" />
          選擇圖片
          <input type="file" accept="image/*" onChange={selectFile} hidden />
        </label>
      </div>

      {value ? (
        <div className="cover-field__current">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="目前封面圖片" />
          <input value={value} onChange={(event) => setValue(event.target.value)} aria-label="封面圖片 URL" />
        </div>
      ) : (
        <input
          className="cover-field__url"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="也可以直接貼上封面圖片 URL"
          aria-label="封面圖片 URL"
        />
      )}

      {sourceUrl && (
        <div className="cover-cropper">
          <div className="cover-cropper__stage">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sourceUrl} alt="待裁切封面" style={previewStyle} />
          </div>
          <div className="cover-cropper__controls">
            <label>
              縮放
              <input type="range" min="1" max="2" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
            </label>
            <label>
              左右
              <input type="range" min="-25" max="25" step="1" value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} />
            </label>
            <label>
              上下
              <input type="range" min="-25" max="25" step="1" value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} />
            </label>
          </div>
          <div className="cover-cropper__actions">
            <button className="admin-button" type="button" onClick={uploadCroppedCover} disabled={isUploading}>
              {isUploading ? <Loader2 size={16} aria-hidden="true" /> : <Scissors size={16} aria-hidden="true" />}
              {isUploading ? "上傳中…" : "裁切並上傳封面"}
            </button>
            <button className="admin-button admin-button--secondary" type="button" onClick={() => setSourceUrl("")} disabled={isUploading}>
              <X size={16} aria-hidden="true" />
              取消
            </button>
          </div>
        </div>
      )}

      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}

async function cropToBlob(sourceUrl: string, zoom: number, offsetX: number, offsetY: number): Promise<Blob> {
  const image = await loadImage(sourceUrl);
  const canvas = document.createElement("canvas");
  canvas.width = COVER_WIDTH;
  canvas.height = COVER_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("瀏覽器不支援圖片裁切。");

  const baseScale = Math.max(COVER_WIDTH / image.naturalWidth, COVER_HEIGHT / image.naturalHeight);
  const scale = baseScale * zoom;
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const maxX = Math.max(0, (drawWidth - COVER_WIDTH) / 2);
  const maxY = Math.max(0, (drawHeight - COVER_HEIGHT) / 2);
  const dx = (COVER_WIDTH - drawWidth) / 2 + (offsetX / 25) * maxX;
  const dy = (COVER_HEIGHT - drawHeight) / 2 + (offsetY / 25) * maxY;

  ctx.fillStyle = "#f6f3ee";
  ctx.fillRect(0, 0, COVER_WIDTH, COVER_HEIGHT);
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("封面裁切失敗。"));
    }, "image/jpeg", 0.9);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("圖片讀取失敗，請重新選擇檔案。"));
    image.src = src;
  });
}
