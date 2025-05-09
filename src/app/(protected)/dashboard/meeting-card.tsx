import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/firebase";
import { Presentation, Upload } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const MeetingCard = () => {
  const router = useRouter();
  const { project } = useProject();
  const uploadMeeting = api.project.uploadMeeting.useMutation();
  const [progress, setProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    maxSize: 50_000_000,
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (!project) {
        throw new Error("project not found");
      }
      setIsUploading(true);
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (!file) {
        throw new Error("file not found");
      }
      const downloadUrl = (await uploadFile(
        file as File,
        setProgress,
      )) as string;
      uploadMeeting.mutate({
        name: file.name,
        meetingUrl: downloadUrl,
        projectId: project.id,
      },{
        onSuccess: (meeting)=>{
            toast.success("Meeting uploaded successfully.")
            router.push('/meetings')
            processMeeting.mutateAsync({
              meetingId:meeting.id,
              meetingUrl:downloadUrl,
              projectId:project.id
            })
        },
        onError:()=>{
            toast.error("Failed to upload meeting.")
        }
      });
      setIsUploading(false);
    },
  });
  const processMeeting = useMutation({
    mutationFn:async function (data:{meetingUrl:string,meetingId:string,projectId:string}){
       const { meetingUrl,meetingId,projectId } = data
       const response = await axios.post('/api/process-meeting',{meetingId,meetingUrl,projectId})
       return response.data
    }
  })

  return (
    <div
      className="col-span-2 flex flex-col items-center justify-center p-10"
      {...getRootProps()}
    >
      {!isUploading && (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-gray-800">
            Create a new meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyse your meeting with Dioysus.
            <br />
            Powered by AI.
          </p>
          <div className="mt-6">
            <Button 
            className="hover:cursor-pointer"
            disabled={isUploading}>
              <Upload
                className="mr-1.5 -ml-0.5 h-5 w-5"
                aria-hidden="true"
              ></Upload>
              Upload Meeting
              <input className="hidden" {...getInputProps()}></input>
            </Button>
          </div>
        </>
      )}
      {isUploading && (
        <div>
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            className="size-20"
            styles={buildStyles({
              pathColor: "#2563eb",
              textColor: "#2563eb",
            })}
          ></CircularProgressbar>
          <p className="text-center text-sm text-gray-500">
            Uploading your meeting...
          </p>
        </div>
      )}
    </div>
  );
};

export default MeetingCard;
