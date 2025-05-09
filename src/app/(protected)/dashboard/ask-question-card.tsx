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
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";


const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [fileReferences, setFileReferences] = React.useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = React.useState("");
  const saveAnswer = api.project.saveAnswer.useMutation()
  const refetch = useRefetch()

  const handleDialogClose = (open: boolean) => {
    if (!open && !saveAnswer.isPending) {
      // Only reset if not in the middle of saving
      setQuestion("");
      setAnswer("");
      setFileReferences([]);
    }
    setOpen(open);
  };

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

      let accumulatedAnswer = "";
      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          accumulatedAnswer += delta;
          setAnswer((prev) => prev + delta);
        }
      }
    } catch (error) {
      console.error("Error in AskQuestionCard:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[80vw] sm:max-h-full overflow-scroll">
          <DialogHeader>
          <div className="flex items-center gap-2">
          <DialogTitle>
              <Image src="/logo.png" alt="logo" width={40} height={40} /> 
            </DialogTitle>
            <Button disabled={saveAnswer.isPending} variant={'outline'} className="hover:cursor-pointer" onClick={()=>{
              saveAnswer.mutate({
                projectId:project!.id,
                answer,
                question,
                fileReferences
              },{
                onSuccess:()=>{
                  toast.success("Answer saved!")
                  refetch()
                },
                onError:()=>{toast.error("Couldn't save answer")}
              })

            }}>Save Answer</Button>
          </div>
          </DialogHeader>

          <div data-color-mode="light">
      <MDEditor.Markdown source={answer} className="max-w-[70vw] !h-full max-h-[40vh] overflow-scroll scrollbar-hide " />
      </div>
      <div className="h-4"></div>
      <CodeRefrences fileReferences={fileReferences}></CodeRefrences>
      <Button type="button" className="hover:cursor-pointer"  onClick={() => handleDialogClose(false)} >Close</Button>
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
            <Button type="submit" className="hover:cursor-pointer" disabled={loading}>
               Ask Dionysus!
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
