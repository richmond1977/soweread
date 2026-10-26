# 成長週報的統計與實驗比較

2026-10-26 修正。

- 全站總量由 GSC 的無維度、`byProperty`、`web`、`final` 查詢取得，保存於 `GrowthSnapshot.rawRows.propertyTotals`，含來源期間及擷取時間。
- 搜尋詞資料加總另列為小計；匿名查詢及 API 列數限制使它不能代替全站總量。舊快照缺少獨立總量時顯示 `UNKNOWN`。
- 搜尋詞級數字與同詞各頁數字分開呈現；主承接頁按曝光、點擊、排名、URL 排序。頁面加總不代替 property 總量。
- 排序分數及 CTR 基準差額僅為規則候選訊號，不是收益、損失或排名預測。低 CTR 候選與排名改善候選可以重疊。
- 互搶章節揭露每頁曝光門檻，未達門檻不代表沒有競爭；同詞多頁也不能直接判定為有害競爭。
- 基準須完全在登記改版日前，比較窗口須完全在改版日後；排除改版日，兩段等長且不重疊。缺資料不填零。
- 新建實驗的基準使用 GSC PT 日曆日，末日不晚於改版前一天或 PT 今天減三日，取較早者，並保留實際 28 日範圍。三日為發布緩衝策略，並非 Google 異常延遲的保證。
- 基準修復保留 `repairProvenance.originalBaseline`，並以 compare-and-set 避免覆蓋同時更新；不更改實驗決定。

## 既有資料修復

先備份指定快照、實驗及週報；業務數據留在資料庫或本機私人驗收檔案，不提交 public repo。

```powershell
node scripts/growth/experiment.mjs repair-baselines --site growth
node scripts/growth/backfill_totals.mjs --end-date YYYY-MM-DD --dry-run
```

dry-run 會讀取 DB 與 GSC，不寫 DB。確認期間及來源後套用：

```powershell
node scripts/growth/experiment.mjs repair-baselines --site growth --apply
node scripts/growth/backfill_totals.mjs --end-date YYYY-MM-DD --apply
node scripts/growth/analyze.mjs
```

讀回確認原 query/page rows、coverage、實驗 status/decision 及原始基準留存，並檢查實際產生的 Markdown。修復命令不寄信；需要預覽但不寫週報時可用 `analyze.mjs --dry-run`。

## 雲端驗證

每週工作流程先執行成長模組測試，再取數與產報。手動觸發時可指定 `send_email=false`，驗證整條雲端鏈而不寄信；原有每週排程仍寄送週報。

來源：[GSC Query API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)、[資料分組限制](https://support.google.com/webmasters/answer/17011259)。
