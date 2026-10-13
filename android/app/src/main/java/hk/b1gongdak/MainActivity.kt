package hk.b1gongdak

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.StatFs
import android.provider.OpenableColumns
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.content.Context
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.Spinner
import android.widget.ArrayAdapter
import android.widget.TextView
import android.widget.Toast
import com.google.ai.edge.litertlm.Backend
import com.google.ai.edge.litertlm.Contents
import com.google.ai.edge.litertlm.Conversation
import com.google.ai.edge.litertlm.ConversationConfig
import com.google.ai.edge.litertlm.Engine
import com.google.ai.edge.litertlm.EngineConfig
import com.google.ai.edge.litertlm.Message
import java.io.File
import java.util.concurrent.Executors

/** B1 講得掂 native Android proof of concept.
 *  Unlike the original keyword web chatbot, all replies go through a real local LLM.
 *  No INTERNET, no microphone, and no network account requirements.
 */
class MainActivity : Activity() {
    private val worker = Executors.newSingleThreadExecutor()
    private lateinit var history: LocalHistory
    private val turns = mutableListOf<LocalHistory.Turn>()
    private var engine: Engine? = null
    private var conversation: Conversation? = null
    private var busy = false

    private lateinit var status: TextView
    private lateinit var chatList: LinearLayout
    private lateinit var chatScroll: ScrollView
    private lateinit var input: EditText
    private lateinit var send: Button
    private lateinit var load: Button
    private lateinit var topicChoice: Spinner
    private lateinit var modeChoice: Spinner

    private val navy = Color.rgb(34, 48, 74)
    private val sage = Color.rgb(61, 119, 98)
    private val pale = Color.rgb(239, 247, 243)
    private val light = Color.rgb(248, 249, 253)
    private val cardBlue = Color.rgb(235, 240, 255)
    private val inkMute = Color.rgb(103, 116, 137)
    private fun d(n: Int): Int = (resources.displayMetrics.density * n + .5f).toInt()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.rgb(239, 244, 251)
        window.navigationBarColor = Color.WHITE
        @Suppress("DEPRECATION")
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        history = LocalHistory(this)
        turns.addAll(history.read())
        buildUi()
        renderTurns()
        if (File(filesDir, MODEL_PATH).isFile) {
            status.text = "已找到本機模型，請按『啟動離線 AI』"
            load.text = "▶ 啟動離線 AI"
        }
    }

    private fun rounded(color: Int, radius: Int = 18): GradientDrawable = GradientDrawable().apply {
        setColor(color); cornerRadius = d(radius).toFloat()
    }
    private fun label(text: String, size: Float = 15f, bold: Boolean = false, color: Int = navy): TextView =
        TextView(this).apply { this.text = text; textSize = size; setTextColor(color); if (bold) setTypeface(null, Typeface.BOLD) }
    private fun spacer(height: Int) = View(this).apply { layoutParams = LinearLayout.LayoutParams(1, d(height)) }
    private fun vertical(): LinearLayout = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
    private fun <T : View> padding(v: T, n: Int): T = v.apply { setPadding(d(n), d(n), d(n), d(n)) }
    private fun action(text: String, secondary: Boolean = false) = Button(this).apply {
        this.text = text; isAllCaps = false; textSize = 14f
        setTextColor(if (secondary) navy else Color.WHITE)
        background = rounded(if (secondary) cardBlue else sage, 13)
        minimumHeight = d(48)
    }
    private fun fullWidth(bottom: Int = 0) = LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = d(bottom) }

    private fun buildUi() {
        val page = vertical().apply { setBackgroundColor(Color.WHITE) }
        setContentView(page)

        val top = padding(vertical(), 20).apply { background = rounded(light, 0) }
        top.addView(label("B1 講得掂", 27f, true), fullWidth())
        top.addView(label("Offline Speaking Coach • Android 原生試驗版", 12f, false, inkMute), fullWidth(10))
        status = label("尚未載入模型 — 需要先下載一次免費模型", 12f, false, inkMute)
        top.addView(status, fullWidth(8))
        val actions = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        load = action("📂 匯入離線 AI 模型", true)
        val guide = action("模型下載指引", true)
        actions.addView(load, LinearLayout.LayoutParams(0, d(48), 2f).apply { marginEnd = d(8) })
        actions.addView(guide, LinearLayout.LayoutParams(0, d(48), 1f))
        top.addView(actions, fullWidth())
        page.addView(top, fullWidth())

        val config = padding(vertical(), 14)
        config.addView(label("主題與練習模式", 13f, true), fullWidth(7))
        val selectRow = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        topicChoice = Spinner(this)
        topicChoice.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, B1Tutor.topics.keys.toList())
        modeChoice = Spinner(this)
        modeChoice.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, listOf("Coach", "Exam"))
        selectRow.addView(topicChoice, LinearLayout.LayoutParams(0, d(48), 2f))
        selectRow.addView(modeChoice, LinearLayout.LayoutParams(0, d(48), 1f))
        config.addView(selectRow, fullWidth(6))
        val tools = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        val factsBtn = action("✎ 個人資料", true)
        val newBtn = action("↻ 新對話", true)
        tools.addView(factsBtn, LinearLayout.LayoutParams(0, d(46), 1f).apply { marginEnd = d(8) })
        tools.addView(newBtn, LinearLayout.LayoutParams(0, d(46), 1f))
        config.addView(tools, fullWidth())
        page.addView(config, fullWidth())

        chatList = vertical().apply { setPadding(d(14), d(10), d(14), d(18)) }
        chatScroll = ScrollView(this).apply {
            fillViewport = true; isVerticalScrollBarEnabled = true
            background = rounded(light, 18)
            addView(chatList, ScrollView.LayoutParams(-1, -2))
        }
        page.addView(chatScroll, LinearLayout.LayoutParams(-1, 0, 1f).apply {
            marginStart = d(12); marginEnd = d(12)
        })

        val composer = padding(vertical(), 12)
        composer.addView(label("打字同導師真正對答（先驗證文字理解）", 12f, false, inkMute), fullWidth(5))
        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.BOTTOM }
        input = EditText(this).apply {
            hint = "例如：What would you like to ask?"
            textSize = 15f; minLines = 1; maxLines = 4
            setPadding(d(13), d(8), d(13), d(8))
            background = rounded(light, 14)
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_SENTENCES or InputType.TYPE_TEXT_FLAG_MULTI_LINE
        }
        send = action("發送")
        row.addView(input, LinearLayout.LayoutParams(0, -2, 1f).apply { marginEnd = d(8) })
        row.addView(send, LinearLayout.LayoutParams(d(76), d(52)))
        composer.addView(row, fullWidth())
        page.addView(composer, fullWidth())

        load.setOnClickListener { if (File(filesDir, MODEL_PATH).isFile) loadModel() else chooseModel() }
        guide.setOnClickListener { showModelGuide() }
        factsBtn.setOnClickListener { editFacts() }
        newBtn.setOnClickListener { confirmNewConversation() }
        send.setOnClickListener { sendMessage() }
        showNotice("呢版係真正離線 AI 文字互動測試；語音要等文字對話驗證成功先加入。")
    }

    private fun showNotice(text: String) {
        val box = padding(label(text, 12f, false, inkMute), 12).apply { background = rounded(pale, 12) }
        chatList.addView(box, fullWidth(10))
    }
    private fun renderTurns() {
        chatList.removeAllViews()
        if (turns.isEmpty()) {
            showNotice("👩🏻‍🏫 準備好之後，試問：What would you like to ask? 或 Can you make it more specific? 由 AI 根據上下文回答，唔係固定句型。")
        } else {
            turns.forEach { t -> addBubble(t.role, t.text) }
        }
        scrollDown()
    }
    private fun addBubble(role: String, message: String) {
        val right = role == "user"
        val wrap = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = if (right) Gravity.END else Gravity.START }
        val bubble = vertical().apply {
            background = rounded(if (right) cardBlue else pale, 16)
            setPadding(d(14), d(12), d(14), d(12))
        }
        bubble.addView(label(if (right) "YOU" else "OFFLINE AI COACH", 10f, true, inkMute), fullWidth(5))
        bubble.addView(label(message, 15f, false, navy), fullWidth())
        wrap.addView(bubble, LinearLayout.LayoutParams(d(285), -2))
        chatList.addView(wrap, fullWidth(12))
        scrollDown()
    }
    private fun scrollDown() { chatScroll.post { chatScroll.fullScroll(View.FOCUS_DOWN) } }
    private fun setBusy(value: Boolean, message: String) {
        busy = value; send.isEnabled = !value && conversation != null
        load.isEnabled = !value; input.isEnabled = !value
        status.text = message
    }

    private fun chooseModel() {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE); type = "*/*"
        }
        @Suppress("DEPRECATION")
        startActivityForResult(intent, REQUEST_MODEL)
    }
    @Deprecated("legacy SAF result")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_MODEL && resultCode == RESULT_OK) data?.data?.let { importModel(it) }
    }
    private fun importModel(uri: Uri) {
        setBusy(true, "複製模型到手機私人儲存中…（可能需要 1–2 分鐘）")
        worker.execute {
            try {
                val name = contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use {
                    if (it.moveToFirst()) it.getString(0) else ""
                } ?: ""
                require(name.lowercase().endsWith(".litertlm")) { "請揀 .litertlm 模型檔案，而唔係 .gguf 或 .task" }
                val free = StatFs(filesDir.absolutePath).availableBytes
                require(free >= MIN_SPACE) { "手機可用儲存不足，建議最少保留 1 GB 空間" }
                val target = File(filesDir, MODEL_PATH)
                target.parentFile?.mkdirs()
                val temp = File(target.parentFile, "model.download")
                contentResolver.openInputStream(uri)?.use { input ->
                    temp.outputStream().use { output -> input.copyTo(output, bufferSize = 1024 * 1024) }
                } ?: error("無法讀取所選檔案")
                require(temp.length() in MIN_MODEL_SIZE..MAX_MODEL_SIZE) { "模型檔案大小異常，可能未下載完成" }
                // Replace only after successfully copying and basic validating.
                if (target.exists()) target.delete()
                require(temp.renameTo(target)) { "無法完成模型匯入" }
                runOnUiThread { loadModel() }
            } catch (t: Throwable) {
                runOnUiThread { setBusy(false, "匯入失敗：${t.message}"); load.text = "📂 匯入離線 AI 模型" }
            }
        }
    }
    private fun loadModel() {
        if (busy) { // called after import; reset state for scheduled load.
            busy = false
        }
        setBusy(true, "正在載入手機內嘅 AI 模型（CPU，需等候）…")
        worker.execute {
            try {
                val file = File(filesDir, MODEL_PATH)
                require(file.exists()) { "仲未匯入模型" }
                closeEngine()
                val localEngine = Engine(EngineConfig(modelPath = file.absolutePath, backend = Backend.CPU()))
                localEngine.initialize()
                engine = localEngine
                buildConversation()
                runOnUiThread {
                    setBusy(false, "離線 AI 已載入，可以真正連續對話 ✅")
                    load.text = "✓ 模型已載入"
                    load.isEnabled = false
                }
            } catch (t: Throwable) {
                closeEngine()
                runOnUiThread {
                    setBusy(false, "啟動失敗（裝置可能唔兼容）：${t.message ?: t.javaClass.simpleName}")
                    load.text = "↻ 重試載入模型"
                    AlertDialog.Builder(this).setTitle("未能載入離線模型")
                        .setMessage("${t.message ?: t.javaClass.simpleName}\n\n請回報手機型號、Android 版本同呢段錯誤；唔會假裝已經可以互動。")
                        .setPositiveButton("知道") { d, _ -> d.dismiss() }.show()
                }
            }
        }
    }
    private fun buildConversation() {
        conversation?.close()
        val historyMessages = turns.takeLast(12).map { if (it.role == "user") Message.user(it.text) else Message.model(it.text) }
        conversation = engine?.createConversation(
            ConversationConfig(
                systemInstruction = Contents.of(B1Tutor.prompt(topicChoice.selectedItem.toString(), modeChoice.selectedItem.toString(), history.facts)),
                initialMessages = historyMessages,
                maxOutputToken = 150
            )
        )
    }
    private fun sendMessage() {
        val msg = input.text.toString().trim()
        if (msg.isEmpty()) { Toast.makeText(this, "請先輸入英文", Toast.LENGTH_SHORT).show(); return }
        if (conversation == null) {
            AlertDialog.Builder(this).setMessage("請先從下載指引取得免費模型，然後匯入並啟動離線 AI。")
                .setPositiveButton("了解", null).show()
            return
        }
        if (busy) return
        input.setText("")
        (getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager)?.hideSoftInputFromWindow(input.windowToken, 0)
        turns.add(LocalHistory.Turn("user", msg)); history.write(turns)
        addBubble("user", msg)
        setBusy(true, "AI 正喺手機思考中（舊手機可能較慢）…")
        worker.execute {
            try {
                val answer = conversation?.sendMessage(msg)?.toString()?.trim().orEmpty()
                require(answer.isNotBlank()) { "本機模型冇產生文字" }
                runOnUiThread {
                    turns.add(LocalHistory.Turn("model", answer)); history.write(turns)
                    addBubble("model", answer)
                    setBusy(false, "離線 AI 已回答 · 全程無收費 API")
                }
            } catch (t: Throwable) {
                runOnUiThread {
                    showNotice("AI 處理失敗：${t.message ?: t.javaClass.simpleName}。呢次唔會提供虛構嘅固定答案。")
                    // Error can leave internal chat state inconsistent; reinitialize on reset.
                    setBusy(false, "推理失敗，請重新開始對話或重載模型")
                }
            }
        }
    }
    private fun editFacts() {
        val field = EditText(this).apply {
            setText(history.facts)
            hint = "例如：I have one daughter. She is 13 years old."
            minLines = 4; inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE
            setPadding(d(14), d(10), d(14), d(10))
        }
        AlertDialog.Builder(this).setTitle("確認過嘅個人資料")
            .setMessage("只寫自己確認過嘅資料。AI 會根據呢啲資料教你講，唔會上傳雲端。修改後會開新練習對話。")
            .setView(field)
            .setNegativeButton("取消", null)
            .setPositiveButton("儲存") { _, _ -> history.facts = field.text.toString().trim(); resetConversation() }
            .show()
    }
    private fun confirmNewConversation() {
        if (busy) { Toast.makeText(this, "請等候模型完成回應", Toast.LENGTH_SHORT).show(); return }
        AlertDialog.Builder(this).setTitle("開始新對話？")
            .setMessage("會清除目前對話文字。你確認過嘅個人資料會保留。")
            .setNegativeButton("取消", null)
            .setPositiveButton("開始") { _, _ -> resetConversation() }
            .show()
    }
    private fun resetConversation() {
        if (busy) return
        turns.clear(); history.clear(); renderTurns()
        if (engine != null) {
            setBusy(true, "正在開新 AI 對話…")
            worker.execute {
                try {
                    buildConversation()
                    runOnUiThread { setBusy(false, "新對話準備好，可以輸入英文") }
                } catch (t: Throwable) {
                    runOnUiThread { setBusy(false, "重設失敗：${t.message}") }
                }
            }
        }
    }
    private fun showModelGuide() {
        val modelPage = "https://huggingface.co/litert-community/Qwen3-0.6B/blob/main/Qwen3-0.6B_dynamic_wi4b32_afp32.litertlm"
        AlertDialog.Builder(this).setTitle("一次下載免費 AI 模型")
            .setMessage("1. 用手機開啟 Hugging Face 模型頁（Apache 2.0）。\n2. 下載 Qwen3-0.6B_dynamic_wi4b32_afp32.litertlm（約 329 MB），等下載完成。\n3. 返嚟本 App 撳『匯入離線 AI 模型』，從 Downloads 揀呢個檔案。\n4. 等模型初始化，之後可離線進行文字對答。\n\nS21／S22 Ultra 未經真機驗證，建議手機最少預留 1 GB 空間；下載模型需要網絡，但推理本身唔需要。")
            .setNegativeButton("稍後", null)
            .setPositiveButton("開啟下載頁") { _, _ ->
                try { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(modelPage))) }
                catch (t: Throwable) { Toast.makeText(this, "開唔到瀏覽器：${t.message}", Toast.LENGTH_LONG).show() }
            }.show()
    }
    private fun closeEngine() {
        try { conversation?.close() } catch (_: Throwable) {}
        conversation = null
        try { engine?.close() } catch (_: Throwable) {}
        engine = null
    }
    override fun onDestroy() {
        worker.execute { closeEngine() }
        worker.shutdown()
        super.onDestroy()
    }
    companion object {
        private const val REQUEST_MODEL = 51
        private const val MODEL_PATH = "models/model.litertlm"
        private const val MIN_MODEL_SIZE = 100L * 1024 * 1024
        private const val MAX_MODEL_SIZE = 2L * 1024 * 1024 * 1024
        private const val MIN_SPACE = 1L * 1024 * 1024 * 1024
    }
}