import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import React from "react";
import { askQuestion } from "./actions";
import useProject from "@/hooks/use-project";
import { readStreamableValue } from "ai/rsc";
import MDEditor from '@uiw/react-md-editor';
import CodeRefrences from "./code-refrences";


const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [fileReferences, setFileReferences] = React.useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = React.useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!project?.id) {
      console.warn("Project ID not found in AskQuestionCard.");
      return;
    }

    try {
      setLoading(true);
      setAnswer("");
      setFileReferences([]);

      const { output, fileReferences } = await askQuestion(
        question,
        project.id,
      );
      setOpen(true)
      setFileReferences(fileReferences);
      const response = await askQuestion(question, project.id);
      console.log("askQuestion response:", response);

      let accumulatedAnswer = "";
      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          accumulatedAnswer += delta;
          setAnswer((prev) => prev + delta);
        }
      }

      console.log("Final answer:", accumulatedAnswer);
    } catch (error) {
      console.error("Error in AskQuestionCard:", error);
    } finally {
      setLoading(false);
      setQuestion("");
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw] sm:max-h-full overflow-scroll scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image src="/logo.png" alt="logo" width={40} height={40} />
              <span> </span>
            </DialogTitle>
          </DialogHeader>

          <div data-color-mode="light">
      <MDEditor.Markdown source={answer} className="max-w-[70vw] !h-full max-h-[40vh] overflow-scroll scrollbar-hide " />
      </div>
      <div className="h-4"></div>
      <CodeRefrences fileReferences={fileReferences}></CodeRefrences>
      <Button type="button" onClick={()=>setOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
      {/* relative col-span-3 */}
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question!</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the homepage layout?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              disabled={loading}
            />
            <div className="h-4" />
            <Button type="submit" disabled={loading}>
               Ask Dionysus!
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
