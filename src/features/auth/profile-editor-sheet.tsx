"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import NextImage from "next/image";
import { ImagePlus, Trash2, X } from "lucide-react";

const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const PROFILE_IMAGE_SIZE = 512;

async function resizeProfileImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (file.size > MAX_SOURCE_BYTES) throw new Error("Choose an image smaller than 10 MB.");

  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = sourceUrl;
    await image.decode();
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const sourceX = (image.naturalWidth - side) / 2;
    const sourceY = (image.naturalHeight - side) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = PROFILE_IMAGE_SIZE;
    canvas.height = PROFILE_IMAGE_SIZE;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This image could not be prepared.");
    context.drawImage(image, sourceX, sourceY, side, side, 0, 0, PROFILE_IMAGE_SIZE, PROFILE_IMAGE_SIZE);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export function ProfileEditorSheet({ name, imageUrl, onClose, onSave }: { name: string; imageUrl: string | null; onClose: () => void; onSave: (profile: { name: string; imageUrl: string | null }) => void }) {
  const [draftName, setDraftName] = useState(name);
  const [draftImage, setDraftImage] = useState(imageUrl);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const initial = draftName.trim().charAt(0).toUpperCase() || "?";

  const chooseImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setProcessing(true);
    setError("");
    try { setDraftImage(await resizeProfileImage(file)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "This image could not be prepared."); }
    finally { setProcessing(false); }
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = draftName.trim();
    if (!cleanName) { setError("Enter the name you would like ShelfCare to use."); return; }
    onSave({ name: cleanName, imageUrl: draftImage });
  };

  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Edit profile"><button className="modal-backdrop" onClick={onClose} aria-label="Close profile editor" />
    <section className="bottom-sheet profile-editor-sheet"><div className="sheet-handle" /><div className="sheet-title"><div><span className="card-kicker">YOUR PROFILE</span><h2>Make it yours</h2></div><button onClick={onClose} aria-label="Close profile editor"><X /></button></div>
      <form onSubmit={submit}><div className="profile-image-preview">{draftImage ? <NextImage src={draftImage} alt="Profile preview" width={104} height={104} unoptimized /> : <span>{initial}</span>}</div>
        <div className="profile-photo-actions"><label className="photo-picker"><ImagePlus aria-hidden="true" />{processing ? "Preparing photo…" : draftImage ? "Change photo" : "Choose photo"}<input type="file" accept="image/*" onChange={(event) => void chooseImage(event)} disabled={processing} /></label>{draftImage && <button type="button" onClick={() => setDraftImage(null)}><Trash2 aria-hidden="true" />Remove</button>}</div>
        <label>Display name<input value={draftName} onChange={(event) => setDraftName(event.target.value)} maxLength={40} autoComplete="name" /></label>
        <p className="profile-editor-note">Your photo is cropped to a square and stored with your ShelfCare data on this device.</p>
        {error && <p className="inline-error" role="alert">{error}</p>}
        <div className="sheet-actions"><button type="button" className="scan-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={processing || !draftName.trim()}>Save profile</button></div>
      </form>
    </section>
  </div>;
}
