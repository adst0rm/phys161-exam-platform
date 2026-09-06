export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Problem {
    problem_id: string;
    topic: string;
    problem_text: string;
    requires_unit: boolean;
    image_file?: string | null;
}

export interface ExamSession {
    exam_id: string;
    problems: Problem[];
}

export interface SubmittedAnswer {
    problem_id: string;
    submitted_value?: string | null;
    submitted_unit?: string | null;
}

export interface ProblemResult {
    problem_id: string;
    topic: string;
    problem_text: string;
    unit?: string | null;
    image_file?: string | null;
    submitted_value?: string | null;
    submitted_unit?: string | null;
    correct_value: number;
    mark: number;
    max_mark: number;
    is_correct: boolean;
    number_correct: boolean;
    unit_correct: boolean;
    was_answered: boolean;
    feedback?: string | null;
}

export interface ExamResult {
    exam_id: string;
    score: number;
    total: number;
    percentage: number;
    results: ProblemResult[];
}

export async function startExam(): Promise<ExamSession> {
    const res = await fetch(`${API_URL}/exam/start`);
    if (!res.ok) throw new Error('Failed to start exam');
    return res.json();
}

export async function submitExam(examId: string, answers: SubmittedAnswer[]): Promise<ExamResult> {
    const res = await fetch(`${API_URL}/exam/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
    });
    if (!res.ok) throw new Error('Failed to submit exam');
    return res.json();
}
