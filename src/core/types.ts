export interface WordEntry {
  word: string;
  description: string;
}

export interface DailyWordResponse {
  word: string;
  description: string;
  date: string; // "YYYY-MM-DD" in Europe/Berlin timezone
}
