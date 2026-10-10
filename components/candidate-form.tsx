"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Briefcase,
  FileText,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { ImageUpload } from "@/components/employer-form";
import { updateApplicantProfile } from "@/features/candidate-features/candidate.actions";
import {
  updateApplicantProfileSchema,
  UpdateApplicantProfileData,
} from "@/features/candidate-features/candidate.schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type CandidateFormProps = {
  candidate: any;
};

const CandidateForm = ({ candidate }: CandidateFormProps) => {
  const applicant = candidate?.applicantDetails;
  const metadata = applicant?.metadata || {};
  const [newSkill, setNewSkill] = useState("");
  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<UpdateApplicantProfileData>({
    resolver: zodResolver(updateApplicantProfileSchema),
    defaultValues: {
      biography: applicant?.biography || "",
      location: applicant?.location || "",
      websiteUrl: applicant?.websiteUrl || "",
      experience: applicant?.experience || "",
      avatarUrl: candidate?.avatarUrl || "",
      metadata: {
        title: metadata.title || "",
        skills: metadata.skills || [],
        linkedinUrl: metadata.linkedinUrl || "",
        githubUrl: metadata.githubUrl || "",
        portfolioUrl: metadata.portfolioUrl || "",
        resumeUrl: metadata.resumeUrl || "",
        experienceEntries: metadata.experienceEntries || [],
        educationEntries: metadata.educationEntries || [],
      },
    },
  });

  const skills = getValues("metadata.skills") || [];

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill || skills.includes(skill)) return;
    setValue("metadata.skills", [...skills, skill], { shouldDirty: true });
    setNewSkill("");
  };

  const removeSkill = (skillToRemove: string) => {
    setValue(
      "metadata.skills",
      skills.filter((skill) => skill !== skillToRemove),
      { shouldDirty: true },
    );
  };

  const onSubmit = async (data: UpdateApplicantProfileData) => {
    const result = await updateApplicantProfile(data);
    if (result.status === "SUCCESS") {
      toast.success(result.message);
      reset(data);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <main className="flex-1 overflow-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="container mx-auto max-w-4xl p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your profile information and resume
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col items-start gap-6 sm:flex-row">
                <div className="flex shrink-0 flex-col items-center gap-2 self-center sm:self-start">
                  <Label className="text-sm font-medium">Profile Photo</Label>
                  <Controller
                    name="avatarUrl"
                    control={control}
                    render={({ field }) => (
                      <ImageUpload
                        value={field.value}
                        url={candidate?.avatarUrl}
                        onChange={field.onChange}
                        boxText="Recommended: 400x400px. JPG, PNG or WebP, max 5 MB."
                      />
                    )}
                  />
                </div>
                <div className="w-full flex-1 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Full Name</Label>
                      <Input
                        id="fullname"
                        value={candidate?.name || ""}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Professional Title</Label>
                      <Input
                        id="title"
                        {...register("metadata.title")}
                        placeholder="e.g. Senior Frontend Developer"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="biography">Bio</Label>
                    <Textarea
                      id="biography"
                      rows={4}
                      {...register("biography")}
                      placeholder="Tell employers about yourself..."
                    />
                    {errors.biography && (
                      <p className="text-xs text-destructive">
                        {errors.biography.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <CardDescription>How employers can reach you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                  <Input id="email" value={candidate?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone
                  </Label>
                  <Input
                    id="phone"
                    value={candidate?.phoneNumber || ""}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Location
                  </Label>
                  <Input
                    id="location"
                    {...register("location")}
                    placeholder="e.g. San Francisco, CA"
                  />
                  {errors.location && (
                    <p className="text-xs text-destructive">
                      {errors.location.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    {...register("websiteUrl")}
                    placeholder="https://yourwebsite.com"
                  />
                  {errors.websiteUrl && (
                    <p className="text-xs text-destructive">
                      {errors.websiteUrl.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    {...register("metadata.linkedinUrl")}
                    placeholder="linkedin.com/in/username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github" className="flex items-center gap-2">
                    <Github className="h-4 w-4" /> GitHub
                  </Label>
                  <Input
                    id="github"
                    {...register("metadata.githubUrl")}
                    placeholder="github.com/username"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Resume</CardTitle>
              <CardDescription>Provide a link to your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 rounded-lg border-2 border-dashed border-border bg-muted/30 p-4">
                <FileText className="h-6 w-6 shrink-0 text-primary" />
                <Input
                  {...register("metadata.resumeUrl")}
                  placeholder="https://link-to-your-resume.pdf"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Skills</CardTitle>
              <CardDescription>Your technical and soft skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(event) => setNewSkill(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Type a skill..."
                />
                <Button type="button" variant="secondary" onClick={addSkill}>
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1">
                    {skill}
                    <button
                      type="button"
                      className="ml-2 hover:text-destructive"
                      onClick={() => removeSkill(skill)}
                      aria-label={`Remove ${skill}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {skills.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    No skills added yet.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5" /> Work Experience
              </CardTitle>
              <CardDescription>
                Your professional history summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={6}
                {...register("experience")}
                placeholder="Describe your work experience..."
              />
              {errors.experience && (
                <p className="mt-2 text-xs text-destructive">
                  {errors.experience.message}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            {isDirty && (
              <Button type="button" variant="outline" onClick={() => reset()}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
};

export default CandidateForm;
