import Anthropic from "@anthropic-ai/sdk";
import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join, relative } from "path";

// ── helpers ────────────────────────────────────────────────────────────────

/** Strip YAML frontmatter from a string. */
function stripFrontmatter(content: string): string {
    return content.replace(/^---[\s\S]*?---\n?/, "").trim();
}

/** Extract the `title:` value from frontmatter (or fall back to the slug). */
function extractTitle(content: string, fallback: string): string {
    const m = content.match(/^---[\s\S]*?title:\s*["']?([^\n"']+)["']?[\s\S]*?---/);
    return m ? m[1].trim() : fallback;
}

/** Derive a /docs/... URL from a filesystem path relative to content/docs. */
function toUrl(relPath: string): string {
    return (
        "/docs/" +
        relPath
            .replace(/\\/g, "/")
            .replace(/\.mdx?$/, "")
            .replace(/(\/index|index)$/, "")
    );
}

/** Walk a directory and return all .md/.mdx file paths. */
async function walk(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const e of entries) {
        const full = join(dir, e.name);
        if (e.isDirectory()) files.push(...(await walk(full)));
        else if (/\.mdx?$/.test(e.name)) files.push(full);
    }
    return files;
}

// ── main ──────────────────────────────────────────────────────────────────

async function main() {
    const root = process.cwd();
    const contentDir = join(root, "content", "docs");

    // 1. Read all MDX files
    const paths = (await walk(contentDir)).sort();

    type Page = { url: string; title: string; body: string };
    const pages: Page[] = await Promise.all(
        paths.map(async (p) => {
            const raw = await readFile(p, "utf-8");
            const rel = relative(contentDir, p);
            const url = toUrl(rel);
            const title = extractTitle(raw, url.split("/").pop() ?? url);
            const body = stripFrontmatter(raw);
            return { url, title, body };
        })
    );

    // 2. Generate public/llms.txt  (page index)
    const llmsTxt = [
        "# Cadence Programming Language",
        "",
        "> Cadence is a resource-oriented programming language for smart contracts on Flow.",
        "> It features strong static types, resource-oriented programming, and capability-based access control.",
        "",
        "> Full docs: https://cadence-lang.org/llms-full.txt",
        "",
        "## Documentation Pages",
        "",
        ...pages.map((p) => `- [${p.title}](https://cadence-lang.org${p.url})`),
    ].join("\n");

    // 3. Generate public/llms-full.txt  (all pages concatenated)
    const llmsFullTxt = pages
        .map((p) => `# ${p.title} (${p.url})\n\n${p.body}`)
        .join("\n\n---\n\n");

    // Write both to public/
    await mkdir(join(root, "public"), { recursive: true });
    await writeFile(join(root, "public", "llms.txt"), llmsTxt, "utf-8");
    await writeFile(join(root, "public", "llms-full.txt"), llmsFullTxt, "utf-8");
    console.log("✅ Wrote public/llms.txt and public/llms-full.txt");

    // 4. Update skills/cadence/SKILL.md via Claude
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.warn("⚠️  ANTHROPIC_API_KEY not set — skipping SKILL.md update");
        return;
    }

    const existingSkill = await readFile(
        join(root, "skills", "cadence", "SKILL.md"),
        "utf-8"
    );

    // Trim docs to avoid token limits (keep first 120k chars)
    const docsDump = llmsFullTxt.slice(0, 120_000);

    const client = new Anthropic({ apiKey });

    console.log("🤖 Calling Claude to update SKILL.md …");

    const message = await client.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 8192,
        messages: [
            {
                role: "user",
                content: `You are maintaining a SKILL.md reference file for the Cadence programming language.
The SKILL.md is consumed by AI coding agents as a compact, high-signal cheat-sheet.

Rules:
- Preserve the existing structure and YAML frontmatter exactly.
- Only update sections whose information has changed or is missing compared to the docs.
- Do NOT pad with fluff; every sentence must add information density.
- Output ONLY the updated SKILL.md content — no preamble, no explanation.

<current_skill>
${existingSkill}
</current_skill>

<latest_docs>
${docsDump}
</latest_docs>`,
            },
        ],
    });

    const updated =
        message.content[0].type === "text"
            ? message.content[0].text
            : existingSkill;

    await writeFile(join(root, "skills", "cadence", "SKILL.md"), updated, "utf-8");
    console.log("✅ Updated skills/cadence/SKILL.md");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
