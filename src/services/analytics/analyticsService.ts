export type AnalyticsEvent =
  | 'app_open'
  | 'game_started'
  | 'game_completed'
  | 'game_over'
  | 'continue_clicked'
  | 'rewarded_ad_requested'
  | 'rewarded_ad_completed'
  | 'interstitial_shown'
  | 'purchase_started'
  | 'purchase_completed'
  | 'highest_tile_reached'
  | 'achievement_unlocked'
  | 'daily_reward_claimed'
  | 'powerup_used'
  | 'theme_changed';

class AnalyticsService {
  logEvent(event: AnalyticsEvent, params: Record<string, any> = {}) {
    // In production, this can forward to Firebase Analytics, Mixpanel, or GameAnalytics
    if (__DEV__) {
      console.log(`[Analytics] 📊 ${event}:`, params);
    }
  }
}

export const analyticsService = new AnalyticsService();
