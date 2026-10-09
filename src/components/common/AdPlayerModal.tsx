import React, { useEffect, useState } from 'react';
import {
  Modal as RNModal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AdRequestConfig, adsService } from '../../services/ads/adsService';
import { Button } from './Button';

export const AdPlayerModal: React.FC = () => {
  const [adConfig, setAdConfig] = useState<AdRequestConfig | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [onCompleteCallback, setOnCompleteCallback] = useState<(() => void) | null>(null);
  const [onCancelCallback, setOnCancelCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    adsService.registerUIHandler((config, onComplete, onCancel) => {
      setAdConfig(config);
      setRemainingSeconds(config.durationSeconds);
      setOnCompleteCallback(() => onComplete);
      setOnCancelCallback(() => onCancel);
    });
  }, []);

  useEffect(() => {
    if (!adConfig || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [adConfig, remainingSeconds]);

  if (!adConfig) return null;

  const canClaimReward = remainingSeconds === 0;

  const handleFinish = () => {
    const cb = onCompleteCallback;
    setAdConfig(null);
    cb?.();
  };

  const handleCancel = () => {
    const cb = onCancelCallback;
    setAdConfig(null);
    cb?.();
  };

  return (
    <RNModal transparent visible={Boolean(adConfig)} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Ad Sponsor Header */}
          <View style={styles.header}>
            <Text style={styles.adBadge}>SPONSORED ADVERTISEMENT</Text>
            <Text style={styles.timer}>
              {remainingSeconds > 0 ? `Reward in ${remainingSeconds}s` : 'Reward Ready!'}
            </Text>
          </View>

          {/* Ad Creative Simulation */}
          <View style={styles.creative}>
            <Text style={styles.creativeIcon}>💎⚡</Text>
            <Text style={styles.title}>{adConfig.title}</Text>
            {adConfig.rewardDescription && (
              <View style={styles.rewardBox}>
                <Text style={styles.rewardText}>
                  Reward: {adConfig.rewardDescription}
                </Text>
              </View>
            )}
            <Text style={styles.creativeDesc}>
              Support Number Merge by checking out top featured puzzle titles. Keep your brain sharp!
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.footer}>
            {canClaimReward ? (
              <Button
                title="Claim Reward & Return ✅"
                variant="accent"
                size="lg"
                onPress={handleFinish}
                style={{ width: '100%' }}
              />
            ) : (
              <Button
                title={`Watching Ad (${remainingSeconds}s)...`}
                variant="secondary"
                disabled={true}
                onPress={() => {}}
                style={{ width: '100%' }}
              />
            )}
            {!canClaimReward && (
              <Button
                title="Cancel (No Reward)"
                variant="outline"
                size="sm"
                onPress={handleCancel}
                style={{ width: '100%', marginTop: 8 }}
              />
            )}
          </View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 999,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0F172A',
    borderColor: '#38BDF8',
    borderWidth: 1.5,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  adBadge: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timer: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
  },
  creative: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  creativeIcon: {
    fontSize: 52,
    marginBottom: 12,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  rewardBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  rewardText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 13,
  },
  creativeDesc: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    width: '100%',
    marginTop: 16,
  },
});
