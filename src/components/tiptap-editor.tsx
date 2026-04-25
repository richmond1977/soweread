"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useRef } from "react";

type TiptapEditorProps = {
  content: string;
  onChange: (html: string) => void;
};

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Placeholder.configure({ placeholder: "開始撰寫文章內容…" }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: { class: "tiptap-content" },
    },
  });

  const insertLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("請輸入連結 URL");
    if (!url) return;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const insertImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = (await res.json()) as { url?: string; error?: string };
        if (json.url) {
          editor.chain().focus().setImage({ src: json.url, alt: file.name }).run();
        }
      } catch {
        alert("圖片上傳失敗，請重試。");
      } finally {
        e.target.value = "";
      }
    },
    [editor]
  );

  if (!editor) return null;

  const btn = (active: boolean) =>
    `tiptap-btn${active ? " tiptap-btn--active" : ""}`;

  return (
    <div className="tiptap-wrapper">
      <div className="tiptap-toolbar">
        <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} title="粗體">
          <strong>B</strong>
        </button>
        <button type="button" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} title="斜體">
          <em>I</em>
        </button>
        <div className="tiptap-divider" />
        <button type="button" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="H2 標題">
          H2
        </button>
        <button type="button" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="H3 標題">
          H3
        </button>
        <div className="tiptap-divider" />
        <button type="button" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="項目清單">
          ☰
        </button>
        <button type="button" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="編號清單">
          1.
        </button>
        <button type="button" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="引言">
          "
        </button>
        <button type="button" className={btn(editor.isActive("codeBlock"))} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="程式碼區塊">
          {"</>"}
        </button>
        <div className="tiptap-divider" />
        <button type="button" className={btn(editor.isActive("link"))} onClick={insertLink} title="插入連結">
          🔗
        </button>
        <button type="button" className="tiptap-btn" onClick={insertImage} title="插入圖片">
          🖼
        </button>
        <div className="tiptap-divider" />
        <button type="button" className="tiptap-btn" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="復原">
          ↩
        </button>
        <button type="button" className="tiptap-btn" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="重做">
          ↪
        </button>
      </div>

      <EditorContent editor={editor} />

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} />
    </div>
  );
}
