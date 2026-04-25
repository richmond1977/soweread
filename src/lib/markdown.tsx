export function renderArticleContent(content: string) {
  // TipTap produces HTML starting with a tag; legacy content is markdown
  if (content.trimStart().startsWith("<")) {
    return <div className="article-body" dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return <div className="article-body">{renderMarkdown(content)}</div>;
}

function renderMarkdown(markdown: string) {
  const blocks = markdown
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    if (block.startsWith("### ")) {
      return <h3 key={index}>{block.replace(/^### /, "")}</h3>;
    }

    if (block.startsWith("> ")) {
      return <blockquote key={index}>{block.replace(/^> /, "")}</blockquote>;
    }

    const imageMatch = block.match(/^!\[(.*?)]\((.*?)\)$/);
    if (imageMatch) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img className="article-inline-image" key={index} src={imageMatch[2]} alt={imageMatch[1]} />;
    }

    if (block.startsWith("- ")) {
      return (
        <ul key={index}>
          {block.split("\n").map((item) => (
            <li key={item}>{formatInline(item.replace(/^- /, ""))}</li>
          ))}
        </ul>
      );
    }

    return <p key={index}>{formatInline(block)}</p>;
  });
}

function formatInline(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
