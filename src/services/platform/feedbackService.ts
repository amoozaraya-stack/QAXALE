/**
 * ORONID TECH Platform Evaluation & Feedback Service
 * Collects, stores, and aggregates user ratings, qualitative feedback,
 * and automated model/agent evaluation metrics.
 * Author: Hamza Yasin / ORONID TECH
 */

export interface UserFeedbackRecord {
  id: string;
  taskId?: string;
  executionId?: string;
  userId: string;
  tenantId?: string;
  module: string;
  rating: number; // 1 to 5
  sentiment: "positive" | "neutral" | "negative";
  category: "accuracy" | "language_quality" | "safety" | "speed" | "general";
  comments?: string;
  language: "om" | "en";
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface FeedbackSummaryStats {
  totalFeedbackCount: number;
  averageRating: number; // 1.0 to 5.0
  positiveRatio: number; // 0.0 to 1.0
  categoryBreakdown: Record<string, number>;
  languageBreakdown: {
    om: number;
    en: number;
  };
  netQualityScore: number; // -100 to +100
}

export class PlatformFeedbackService {
  private static instance: PlatformFeedbackService;
  private records: UserFeedbackRecord[] = [];
  private readonly maxRecords = 5000;

  private constructor() {
    this.seedInitialMetrics();
  }

  public static getInstance(): PlatformFeedbackService {
    if (!PlatformFeedbackService.instance) {
      PlatformFeedbackService.instance = new PlatformFeedbackService();
    }
    return PlatformFeedbackService.instance;
  }

  /**
   * Submits a feedback record.
   */
  public submitFeedback(record: Omit<UserFeedbackRecord, "id" | "timestamp">): UserFeedbackRecord {
    const completeRecord: UserFeedbackRecord = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      ...record,
    };

    this.records.unshift(completeRecord);
    if (this.records.length > this.maxRecords) {
      this.records.pop();
    }

    return completeRecord;
  }

  /**
   * Retrieves recent feedback records with optional filtering.
   */
  public getRecentFeedback(filter?: {
    module?: string;
    language?: "om" | "en";
    minRating?: number;
    limit?: number;
  }): UserFeedbackRecord[] {
    let filtered = this.records;

    if (filter?.module) {
      filtered = filtered.filter((r) => r.module === filter.module);
    }
    if (filter?.language) {
      filtered = filtered.filter((r) => r.language === filter.language);
    }
    if (filter?.minRating) {
      filtered = filtered.filter((r) => r.rating >= filter.minRating!);
    }

    return filtered.slice(0, filter?.limit || 50);
  }

  /**
   * Computes aggregated statistics from collected feedback.
   */
  public calculateStats(): FeedbackSummaryStats {
    if (this.records.length === 0) {
      return {
        totalFeedbackCount: 0,
        averageRating: 5.0,
        positiveRatio: 1.0,
        categoryBreakdown: {},
        languageBreakdown: { om: 0, en: 0 },
        netQualityScore: 100,
      };
    }

    let sumRating = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    const catMap: Record<string, number> = {};
    const langMap = { om: 0, en: 0 };

    for (const r of this.records) {
      sumRating += r.rating;
      if (r.sentiment === "positive" || r.rating >= 4) positiveCount++;
      if (r.sentiment === "negative" || r.rating <= 2) negativeCount++;

      catMap[r.category] = (catMap[r.category] || 0) + 1;
      if (r.language === "om") langMap.om++;
      else langMap.en++;
    }

    const total = this.records.length;
    const netQualityScore = Math.round(((positiveCount - negativeCount) / total) * 100);

    return {
      totalFeedbackCount: total,
      averageRating: Number((sumRating / total).toFixed(2)),
      positiveRatio: Number((positiveCount / total).toFixed(2)),
      categoryBreakdown: catMap,
      languageBreakdown: langMap,
      netQualityScore,
    };
  }

  /**
   * Seeds realistic baseline telemetry for the ORONID TECH evaluation suite.
   */
  private seedInitialMetrics(): void {
    const seed = [
      {
        module: "qaxale-core",
        userId: "usr_seed_1",
        rating: 5,
        sentiment: "positive" as const,
        category: "accuracy" as const,
        comments: "Istaatisiksii fi herrega carraa ifa gochuuf baay'ee gaariidha.",
        language: "om" as const,
      },
      {
        module: "kilimaanjaroo",
        userId: "usr_seed_2",
        rating: 5,
        sentiment: "positive" as const,
        category: "language_quality" as const,
        comments: "Jechoonni teeknooloojii Afaan Oromootti hiikamuun isaanii dinqisiisaadha.",
        language: "om" as const,
      },
      {
        module: "agent-tools",
        userId: "usr_seed_3",
        rating: 5,
        sentiment: "positive" as const,
        category: "speed" as const,
        comments: "Autonomous planning and self-correction worked seamlessly.",
        language: "en" as const,
      },
    ];

    for (const item of seed) {
      this.submitFeedback(item);
    }
  }
}

export const platformFeedbackService = PlatformFeedbackService.getInstance();
