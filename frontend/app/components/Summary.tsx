"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


export default function Summary({ summary }:{ summary:string }) {
  if (!summary) return null;

  return (
    <div className="m-5">
      <Card className="shadow-lg p-4 rounded-lg bg-gray-50 border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            AI-Generated Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}