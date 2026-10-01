import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { CATEGORIES } from "./categories.js";

// レシート読み取りに使うモデル（Claude Haiku の最新版）
const MODEL = "claude-haiku-4-5";

// APIキーは環境変数 ANTHROPIC_API_KEY から SDK が自動で読み込む
const client = new Anthropic();

// Claude に返してもらうレシート情報の形式
const ReceiptSchema = z.object({
  storeName: z.string().describe("店名。読み取れない場合は空文字"),
  date: z.string().describe("購入日（YYYY-MM-DD 形式）。読み取れない場合は空文字"),
  time: z.string().describe("購入時刻（HH:MM 形式・24時間表記）。読み取れない場合は空文字"),
  items: z.array(
    z.object({
      name: z.string().describe("商品名"),
      price: z.number().int().describe("その商品の支払金額（円・税込）。値引き行は負の数"),
      category: z.string().describe(`支出カテゴリ（${CATEGORIES.join(" / ")} のいずれか）`),
    })
  ),
  total: z.number().int().describe("レシートの合計金額（円・税込）"),
});

const PROMPT = `このレシート画像から購入内容を読み取ってください。

- 商品ごとに、商品名・税込の支払金額（円）・カテゴリを抽出してください。
- 数量が複数の場合は、その行の合計金額を price にしてください。
- 値引き・割引の行は負の金額の項目として含めてください。
- 小計・合計・税額・お預かり・お釣りなどの行は items に含めないでください。
- カテゴリは次から選んでください: ${CATEGORIES.join("、")}
  - スーパー等で買った食材・飲料・お菓子は「食費」、飲食店での食事は「外食」です。
- 日付は YYYY-MM-DD 形式にしてください。和暦は西暦に変換してください。
- 時刻は HH:MM 形式（24時間表記）にしてください。`;

/**
 * レシート画像を Claude に送り、構造化されたレシート情報を返す
 * @param {Buffer} imageBuffer 画像データ
 * @param {string} mediaType 画像の MIME タイプ（image/jpeg など）
 */
export async function analyzeReceipt(imageBuffer, mediaType) {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBuffer.toString("base64"),
            },
          },
          { type: "text", text: PROMPT },
        ],
      },
    ],
    output_config: { format: zodOutputFormat(ReceiptSchema) },
  });

  if (response.stop_reason === "refusal") {
    throw new Error("レシートの読み取りが拒否されました");
  }
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    throw new Error("レシートの読み取り結果を解析できませんでした");
  }

  // 一覧にないカテゴリが返ってきた場合は「その他」に寄せる
  const receipt = response.parsed_output;
  receipt.items = receipt.items.map((item) => ({
    ...item,
    category: CATEGORIES.includes(item.category) ? item.category : "その他",
  }));
  return receipt;
}
