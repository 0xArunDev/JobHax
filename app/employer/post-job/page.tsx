"use client";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ArrowRight, ArrowLeft, Eye, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PostJobType,
  postJobType,
} from "@/features/employer-features/employer.schema";
import { postJob } from "@/features/employer-features/employer.actions";
import { redirect } from "next/navigation";

const skillSuggestions = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "AWS",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "PostgreSQL",
  "MongoDB",
];

export default function PostJobPage() {
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript"]);
  const [newSkill, setNewSkill] = useState("");
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PostJobType>({
    resolver: zodResolver(postJobType),
    defaultValues: {
      title: "",
      department: "engineering",
      employmentType: "full-time",
      location: "",
      workplaceType: "onsite",
      salaryMin: 0,
      salaryMax: 0,
      experienceLevel: "entry",
      description: "",
      requirements: "",
      benefits: "",
      skills: [],
      isFeatured: false,
      isUrgent: false,
      notifyCandidates: false,
      status: "published",
    },
  });

  const formValues = watch();

  useEffect(() => {
    setValue("skills", skills, { shouldDirty: true, shouldValidate: true });
  }, [skills, setValue]);

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const onSubmit = async (data: PostJobType) => {
    const result = await postJob(data);
    if (result.status === "SUCCESS") {
      redirect("/employer/jobs");
    }
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        userType="employer"
        userName="TechCorp Inc."
        userEmail="hr@techcorp.com"
      />

      <main className="flex-1 overflow-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="container mx-auto p-6 lg:p-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">
                Post a New Job
              </h1>
              <p className="text-muted-foreground mt-1">
                Fill in the details to create a new job listing
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        step >= s
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`h-1 w-16 sm:w-32 ${step > s ? "bg-primary" : "bg-muted"}`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span
                  className={
                    step >= 1
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }
                >
                  Basic Info
                </span>
                <span
                  className={
                    step >= 2
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }
                >
                  Details
                </span>
                <span
                  className={
                    step >= 3
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }
                >
                  Review
                </span>
              </div>
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the essential details about the position
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Senior Frontend Developer"
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Controller
                        name="department"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="engineering">
                                Engineering
                              </SelectItem>
                              <SelectItem value="design">Design</SelectItem>
                              <SelectItem value="marketing">
                                Marketing
                              </SelectItem>
                              <SelectItem value="sales">Sales</SelectItem>
                              <SelectItem value="hr">
                                Human Resources
                              </SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employment-type">Employment Type *</Label>
                      <Controller
                        name="employmentType"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">
                                Full-time
                              </SelectItem>
                              <SelectItem value="part-time">
                                Part-time
                              </SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="internship">
                                Internship
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="e.g. San Francisco, CA"
                        {...register("location")}
                      />
                      {errors.location && (
                        <p className="text-sm text-destructive">
                          {errors.location.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workplace">Workplace Type</Label>
                      <Controller
                        name="workplaceType"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="onsite">On-site</SelectItem>
                              <SelectItem value="remote">Remote</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="salary-min">Salary Range (Annual)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="salary-min"
                          placeholder="Min"
                          type="number"
                          {...register("salaryMin", { valueAsNumber: true })}
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          id="salary-max"
                          placeholder="Max"
                          type="number"
                          {...register("salaryMax", { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience Level</Label>
                      <Controller
                        name="experienceLevel"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entry">Entry Level</SelectItem>
                              <SelectItem value="mid">Mid Level</SelectItem>
                              <SelectItem value="senior">Senior</SelectItem>
                              <SelectItem value="lead">Lead</SelectItem>
                              <SelectItem value="executive">
                                Executive
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={() => setStep(2)}>
                      Next Step
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                  <CardDescription>
                    Provide detailed information about the role
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      {...register("description", { required: true })}
                      rows={6}
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      {...register("requirements")}
                      rows={4}
                      placeholder="List the required qualifications, skills, and experience..."
                    />
                    {errors.requirements && (
                      <p className="text-sm text-destructive">
                        {errors.requirements.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits & Perks</Label>
                    <Textarea
                      id="benefits"
                      {...register("benefits")}
                      rows={4}
                      placeholder="Describe the benefits package, perks, and company culture..."
                    />
                    {errors.benefits && (
                      <p className="text-sm text-destructive">
                        {errors.benefits.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Required Skills</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="px-3 py-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        onKeyDown={(e) => e.key === "Enter" && addSkill()}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addSkill}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-muted-foreground">
                        Suggestions:
                      </span>
                      {skillSuggestions
                        .filter((s) => !skills.includes(s))
                        .slice(0, 5)
                        .map((skill) => (
                          <button
                            type="button"
                            key={skill}
                            onClick={() => setSkills([...skills, skill])}
                            className="text-sm text-primary hover:underline"
                          >
                            +{skill}
                          </button>
                        ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button type="button" onClick={() => setStep(3)}>
                      Next Step
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Publish</CardTitle>
                  <CardDescription>
                    Review your job listing before publishing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-border p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {formValues.title || "Job Title Here"}
                      </h3>
                      <p className="text-muted-foreground">
                        {formValues.department || "Department"} |{" "}
                        {formValues.location || "Location"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {formValues.workplaceType || "On-site"}
                      </Badge>
                      <Badge variant="outline">
                        {formValues.salaryMin || "$0"} -{" "}
                        {formValues.salaryMax || "$0"}
                      </Badge>
                      <Badge variant="outline">
                        {formValues.experienceLevel || "Senior Level"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">
                        Description
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formValues.description ||
                          "Job description will appear here..."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">
                      Publishing Options
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Controller
                          name="isFeatured"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id="featured"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <label htmlFor="featured" className="text-sm">
                          Feature this job (additional visibility)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Controller
                          name="isUrgent"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id="urgent"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <label htmlFor="urgent" className="text-sm">
                          Mark as urgent hiring
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Controller
                          name="notifyCandidates"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id="notifications"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <label htmlFor="notifications" className="text-sm">
                          Notify matching candidates
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button type="submit">
                        {isSubmitting && (
                          <Loader className="w-4 h-4 animate-spin" />
                        )}
                        {isSubmitting ? "Posting..." : "Publish Job"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
