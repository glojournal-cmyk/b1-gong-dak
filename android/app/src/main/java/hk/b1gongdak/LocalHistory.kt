package hk.b1gongdak

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/** Learner text stays in private Android SharedPreferences, with no network permission. */
class LocalHistory(context: Context) {
    private val pref = context.getSharedPreferences("b1_offline_history_v1", Context.MODE_PRIVATE)
    data class Turn(val role: String, val text: String)
    fun read(): List<Turn> = try {
        val arr = JSONArray(pref.getString("turns", "[]") ?: "[]")
        (0 until arr.length()).mapNotNull { i ->
            val o = arr.optJSONObject(i) ?: return@mapNotNull null
            val role = o.optString("role"); val text = o.optString("text")
            if (role in listOf("user", "model") && text.isNotBlank()) Turn(role, text.take(2000)) else null
        }.takeLast(16)
    } catch (_: Exception) { emptyList() }
    fun write(turns: List<Turn>) {
        val arr = JSONArray()
        turns.takeLast(16).forEach { arr.put(JSONObject().put("role", it.role).put("text", it.text.take(2000))) }
        pref.edit().putString("turns", arr.toString()).apply()
    }
    fun clear() { pref.edit().remove("turns").apply() }
    var facts: String
        get() = pref.getString("confirmed_facts", "") ?: ""
        set(v) { pref.edit().putString("confirmed_facts", v.take(900)).apply() }
}