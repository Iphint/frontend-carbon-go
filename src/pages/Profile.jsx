import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getErrorMessage } from "../api/client";
import { useAuth } from "../api/AuthContext.jsx";
import { useLanguage } from "../api/LanguageContext.jsx";
import feedbackRules from "../data/greenFeedbackRules.json";

function rankName(total) {
  if (total >= 1000) return "Hero";
  if (total >= 500) return "Guardian";
  if (total >= 250) return "Explorer";
  if (total >= 100) return "Seedling";
  return "Seedling";
}

function localized(value, language) {
  if (typeof value === "string") return value;
  return value?.[language] || value?.en || "";
}

export default function Profile() {
  const auth = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [form, setForm] = useState(null);
  const [customForm, setCustomForm] = useState({ name: "", description: "" });
  const [deletedCustomIds, setDeletedCustomIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("carbon_deleted_custom_actions") || "[]");
    } catch {
      return [];
    }
  });
  const [error, setError] = useState("");

  async function load() {
    try {
      const [profileRes, logsRes] = await Promise.all([
        api.get(`/profile/me?lang=${language}`),
        api.get(`/activity-logs/me?lang=${language}`)
      ]);
      setData({ ...profileRes.data, logs: logsRes.data.logs });
      setForm({
        full_name: profileRes.data.profile?.full_name || "",
        address: profileRes.data.profile?.address || "",
        gender: profileRes.data.profile?.gender || "",
        phone_number: profileRes.data.profile?.phone_number || "",
        bio: profileRes.data.profile?.bio || ""
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, [language]);

  async function save(e) {
    e.preventDefault();
    setError("");
    try {
      await api.put("/profile/me", form);
      setEditing(false);
      await Promise.all([load(), auth.refreshMe()]);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function submitCustom(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/activity-logs", {
        activity_id: null,
        other_activity: customForm.name.trim(),
        note: customForm.description.trim() || null
      });
      setCustomForm({ name: "", description: "" });
      setCustomOpen(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function deleteCustomAction(id) {
    setError("");
    const nextDeletedIds = [...new Set([...deletedCustomIds, Number(id)])];
    setDeletedCustomIds(nextDeletedIds);
    localStorage.setItem("carbon_deleted_custom_actions", JSON.stringify(nextDeletedIds));
    setData((current) => current ? {
      ...current,
      logs: current.logs.filter((log) => Number(log.id) !== Number(id))
    } : current);

    try {
      try {
        await api.delete(`/activity-logs/${id}`);
      } catch (deleteError) {
        if (deleteError?.response?.status !== 404) throw deleteError;
        await api.post(`/activity-logs/${id}/delete`);
      }
      await load();
    } catch (err) {
      // Older backend builds may not expose delete routes yet. The action is
      // still hidden locally so the Custom Green Actions UI behaves correctly.
      console.warn(getErrorMessage(err));
    }
  }

  async function logout() {
    await auth.logout();
    navigate("/login", { replace: true });
  }

  if (error) return <div className="form-error">{error}</div>;
  if (!data) return <div className="page-loader">Loading profile...</div>;

  const profile = data.profile || {};
  const logs = data.logs || [];
  const hiddenCustomIds = new Set(deletedCustomIds.map(Number));
  const customActions = logs.filter((log) => (
    !log.activity_id && Number(log.carbon_value) === 0 && !hiddenCustomIds.has(Number(log.id))
  ));
  const score = Number(data.stats.total_carbon);
  const memberDate = data.user.created_at ? new Date(data.user.created_at).toLocaleDateString("en-GB") : "20/5/2026";
  const favoriteHabit = customActions[0]?.other_activity || logs.find((log) => Number(log.carbon_value) > 0)?.activity_name || (language === "id" ? "Mengurangi jejak karbon" : "Reducing carbon footprint");
  const latestCustomText = customActions
    .map((action) => `${action.other_activity || ""} ${action.note || ""}`)
    .join(" ")
    .toLowerCase();
  const matchedFeedback = feedbackRules.find((rule) => (
    rule.keywords.some((keyword) => latestCustomText.includes(keyword.toLowerCase()))
  ));
  const fallbackFeedback = {
    title: {
      en: customActions.length ? "Personal green initiative" : "Getting started",
      id: customActions.length ? "Inisiatif hijau pribadi" : "Mulai perjalanan"
    },
    summary: {
      en: customActions.length
        ? `Your custom action "${customActions[0].other_activity}" shows personal initiative. It is recorded as a zero-point action because it is not part of the standard CU activity list, but it still provides useful context about your environmental behavior.`
        : "No custom green action has been submitted yet. Add one to receive a more specific climate insight based on your own idea.",
      id: customActions.length
        ? `Aksi kustom "${customActions[0].other_activity}" menunjukkan inisiatif pribadi. Aksi ini dicatat sebagai aksi 0 CU karena belum termasuk daftar aktivitas standar, tetapi tetap memberi konteks penting tentang perilaku lingkunganmu.`
        : "Belum ada aksi hijau kustom yang dikirim. Tambahkan satu aksi agar insight iklim bisa lebih spesifik berdasarkan idemu sendiri."
    },
    recommendation: {
      en: score > 0
        ? "Keep combining standard tracked actions for CU progress with custom actions for personal reflection."
        : "Start with one simple action that you can repeat, then describe it clearly so the feedback can be more specific.",
      id: score > 0
        ? "Terus kombinasikan aktivitas standar untuk progres CU dengan aksi kustom sebagai refleksi pribadi."
        : "Mulai dari satu aksi sederhana yang bisa diulang, lalu jelaskan dengan jelas agar feedback menjadi lebih spesifik."
    }
  };
  const feedback = matchedFeedback || fallbackFeedback;
  const feedbackTitle = localized(feedback.title, language);
  const feedbackSummary = localized(feedback.summary, language);
  const feedbackRecommendation = localized(feedback.recommendation, language);
  const feedbackLabels = {
    heading: language === "id" ? "Insight iklim personalmu" : "Your personal climate insight",
    nextStep: language === "id" ? "Langkah berikutnya yang disarankan" : "Recommended next step",
    status: language === "id" ? "Status aksi kustom" : "Custom action status",
    statusText: customActions.length
      ? language === "id"
        ? `Kamu sudah mengirim ${customActions.length} aksi hijau kustom. Aksi ini tetap bernilai 0 CU, tetapi membantu menjelaskan niat dan kebiasaan lingkungan pribadimu.`
        : `You have submitted ${customActions.length} custom green action${customActions.length > 1 ? "s" : ""}. These actions stay at 0 CU, but they help explain your personal environmental intent.`
      : language === "id"
        ? "Belum ada aksi hijau kustom yang dikirim."
        : "No custom green actions have been submitted yet."
  };
  const profileCopy = {
    profileTitle: language === "id" ? "Profil Eko Saya" : "My Eco Profile",
    memberSince: language === "id" ? "Bergabung sejak" : "Member since",
    faveHabit: language === "id" ? "Kebiasaan eko favorit" : "Fave eco-habit",
    climateGoal: language === "id" ? "Target iklim: net-zero pada 2030" : "Climate goal: net-zero by 2030",
    scoreTitle: language === "id" ? "Skor Karbon Saya" : "My Carbon Score",
    totalCu: language === "id" ? "total Unit Karbon (CU)" : "total Carbon Units (CU)",
    activitiesLogged: language === "id" ? "Aktivitas tercatat" : "Activities logged",
    customTitle: language === "id" ? "Aksi Hijau Kustom · nol poin" : "Custom Green Actions · zero points",
    customNote: language === "id"
      ? "Ini adalah inisiatif pribadimu — tidak menambah poin, tetapi membantu memberi feedback."
      : "These are your personal initiatives — they don't add points but they inspire feedback!",
    noCustom: language === "id"
      ? "Belum ada aktivitas kustom. Klik tombol di bawah untuk mengusulkan aksi hijau! (0 poin, tetap bermakna)"
      : "No custom activities yet. Click below to suggest a green action! (0 points, all heart)",
    personalGreenAction: language === "id" ? "Aksi hijau pribadi" : "Personal green action",
    submitCustom: language === "id" ? "Kirim aktivitas kustom baru" : "Submit new custom activity",
    delete: language === "id" ? "Hapus" : "Delete",
    feedbackTitle: language === "id" ? "Feedback Eco-Sense" : "Eco-Sense Feedback",
    footer: language === "id"
      ? "Setiap aksi berarti — terus rawat jejak karbonmu dan inspirasi teman-temanmu!"
      : "Every action counts — keep nurturing your footprint and inspiring friends!",
    modalTitle: language === "id" ? "Kirim Aksi Hijau Kustom" : "Submit Custom Green Action",
    nameGreenAction: language === "id" ? "Nama Aksi Hijau" : "Name Green Action",
    description: language === "id" ? "Deskripsi" : "Description",
    carbonNeutral: language === "id" ? "Nilai karbon: 0 CU / Netral" : "Carbon value: 0 CU / Neutral",
    saveCustom: language === "id" ? "Simpan Aksi Kustom" : "Save Custom Action",
    cancel: language === "id" ? "Batal" : "Cancel",
    editProfile: language === "id" ? "Edit Profil" : "Edit Profile",
    fullName: language === "id" ? "Nama asli" : "Full name",
    address: language === "id" ? "Alamat" : "Address",
    gender: language === "id" ? "Gender" : "Gender",
    phone: language === "id" ? "No telp" : "Phone number",
    bio: language === "id" ? "Bio" : "Bio",
    saveChanges: language === "id" ? "Simpan Perubahan" : "Save Changes"
  };

  return (
    <main className="profile-page">
      <div className="account-container profile-modern">
        <section className="profile-card eco-profile-card">
          <div className="profile-section-title">🧑‍🚀 🌻 {profileCopy.profileTitle}</div>
          <div className="profile-row">
            <div className="avatar-circle">{profile.photo ? <img src={profile.photo} alt="" /> : "🌱"}</div>
            <div className="info-fields">
              <h1>{profile.full_name || data.user.username}<button className="edit-btn" onClick={() => setEditing(true)}>✎ Edit</button></h1>
              <div className="info-badge">
                <span>🗓 {profileCopy.memberSince} {memberDate}</span>
              </div>
              <div className="info-badge">
                <span>🖤 {profileCopy.faveHabit}: {favoriteHabit}</span>
                <span>♻ {profileCopy.climateGoal}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-section-title">🏆 {profileCopy.scoreTitle}</div>
          <div className="score-wrapper profile-score-box">
            <div className="score-number">{score}</div>
            <div className="score-label">♻ {profileCopy.totalCu}</div>
            <div className="score-pill">🏅 {rankName(score)}</div>
            <div className="profile-score-bar"><span style={{ width: `${Math.min(100, Math.max(0, score))}%` }} /></div>
            <small>🧾 {profileCopy.activitiesLogged}: {data.stats.total_activities}</small>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-section-title">👏 ✨ {profileCopy.customTitle} ✨</div>
          <p className="profile-note">ⓘ {profileCopy.customNote}</p>
          <div className="custom-action-list">
            {customActions.length ? customActions.map((item) => (
              <article className="custom-action-item" key={item.id}>
                <div>
                  <strong>🌱 {item.other_activity}</strong>
                  <span>{item.note || profileCopy.personalGreenAction}</span>
                </div>
                <button type="button" className="delete-custom-btn" onClick={() => deleteCustomAction(item.id)}>{profileCopy.delete}</button>
              </article>
            )) : (
              <div className="custom-empty">🌱 🌈 {profileCopy.noCustom}</div>
            )}
          </div>
          <button className="submit-custom-btn" onClick={() => setCustomOpen(true)}>⊕ {profileCopy.submitCustom}</button>
        </section>

        <section className="profile-card feedback-card">
          <div className="profile-section-title">🧠 🌿 {profileCopy.feedbackTitle}</div>
          <div className="feedback-panel">
            <h3>💬 {feedbackLabels.heading}</h3>
            <div className="feedback-insight">
              <strong>{feedbackTitle}</strong>
              <p>{feedbackSummary}</p>
            </div>
            <div className="feedback-insight">
              <strong>{feedbackLabels.nextStep}</strong>
              <p>{feedbackRecommendation}</p>
            </div>
            <div className="feedback-insight">
              <strong>{feedbackLabels.status}</strong>
              <p>{feedbackLabels.statusText}</p>
            </div>
          </div>
        </section>

        <div className="logout-section profile-logout">
          <button className="logout-btn" onClick={logout}>↪ {t("logout")}</button>
        </div>
        <p className="profile-footer">🌱 {profileCopy.footer} 🌍</p>
      </div>

      {customOpen && (
        <div className="modal-overlay">
          <form className="edit-modal" onSubmit={submitCustom}>
            <h3>{profileCopy.modalTitle}</h3>
            <label>{profileCopy.nameGreenAction}<input required value={customForm.name} onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })} /></label>
            <label>{profileCopy.description}<textarea required value={customForm.description} onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })} /></label>
            <div className="neutral-badge">{profileCopy.carbonNeutral}</div>
            <button className="btn-primary">{profileCopy.saveCustom}</button>
            <button type="button" className="btn-secondary" onClick={() => setCustomOpen(false)}>{profileCopy.cancel}</button>
          </form>
        </div>
      )}

      {editing && (
        <div className="modal-overlay">
          <form className="edit-modal" onSubmit={save}>
            <h3>{profileCopy.editProfile}</h3>
            <label>{profileCopy.fullName}<input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label>
            <label>{profileCopy.address}<textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
            <label>{profileCopy.gender}<input required value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} /></label>
            <label>{profileCopy.phone}<input required value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} /></label>
            <label>{profileCopy.bio}<textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
            <button className="btn-primary">{profileCopy.saveChanges}</button>
            <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>{profileCopy.cancel}</button>
          </form>
        </div>
      )}
    </main>
  );
}
