// A/B Testing Yöneticisi
export class ABTestManager {
  static assignGroup(userId) {
    // UserId hash'ine göre sürekli aynı gruba atama
    const hash = this.hashString(userId);
    return hash % 2 === 0 ? 'control' : 'experiment';
  }

  static hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  static async logEvent(db, userId, eventType, featureName, metadata = {}) {
    const eventId = crypto.randomUUID();
    await db.prepare(`
      INSERT INTO ab_test_events (id, user_id, event_type, feature_name, metadata)
      VALUES (?, ?, ?, ?, ?)
    `).bind(eventId, userId, eventType, featureName, JSON.stringify(metadata)).run();
  }

  static async getExperimentalFeatures(abGroup) {
    if (abGroup === 'experiment') {
      return ['relaxation_page', 'binaural_sounds', 'advanced_sleep_analytics'];
    }
    return [];
  }
}