"use client";
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
import {
  Camera,
  Globe,
  Linkedin,
  Twitter,
  MapPin,
  Users,
  Calendar,
  Building2,
  Loader,
  Upload,
  Loader2,
  Trash2,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import {
  companyProfileData,
  CompanyProfileData,
} from "@/features/employer-features/employer.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEmployerProfile } from "@/features/employer-features/employer.actions";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";
import { useUploadThing } from "@/src/utils/uploadthing";
import { ComponentProps, useState, useEffect } from "react";
import { useDropzone } from "@uploadthing/react";

const EmployerForm = ({employer, avatarUrl}: {employer: any, avatarUrl: any}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CompanyProfileData>({
    resolver: zodResolver(companyProfileData),
    defaultValues: {
      companyName: employer?.name || "My Company",
      tagline:
        employer?.metadata?.tagline ||
        "Building the future of technology",
      description:
        employer?.description ||
        "My Company is a leading technology company...",
      industry: employer?.industry || "technology",
      teamSize: employer?.teamSize || "500-1000",
      avatarUrl: avatarUrl,
      yearOfEstablishment:
        employer?.yearOfEstablishment || 2015,
      location: employer?.location || "San Francisco, CA",
      websiteUrl:
        employer?.websiteUrl || "https://mycompany.com",
      linkedinUrl:
        employer?.metadata?.socialLinks?.linkedin ||
        "https://linkedin.com/company/mycompany",
      twitterUrl:
        employer?.metadata?.socialLinks?.twitter ||
        "@mycompany",
      culture:
        employer?.metadata?.culture ||
        "At My Company, we believe in fostering a collaborative environment...",
      benefits:
        employer?.metadata?.benefits ||
        "• Competitive salary\n• Health insurance\n• Remote-friendly",
    },
  });

  const onSubmit = async (data: CompanyProfileData) => {
    const payload = {
      name: data.companyName,
      description: data.description,
      industry: data.industry,
      teamSize: data.teamSize,
      yearOfEstablishment: data.yearOfEstablishment,
      location: data.location,
      websiteUrl: data.websiteUrl,
      avatarUrl: data.avatarUrl,
      metadata: {
        tagline: data.tagline,
        culture: data.culture,
        benefits: data.benefits,
        socialLinks: {
          linkedin: data.linkedinUrl,
          twitter: data.twitterUrl,
        },
      },
    };
    await updateEmployerProfile(payload);
  };  
  return (
    <main className="flex-1 overflow-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="container mx-auto p-6 lg:p-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Company Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your company information visible to candidates
            </p>
          </div>

          {/* Company Logo & Basic Info */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex flex-col items-center sm:items-start gap-2 shrink-0 self-center sm:self-start">
                  <Label className="text-sm font-medium">Company Logo</Label>
                  <Controller
                    name="avatarUrl"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col items-center">
                        <ImageUpload
                          value={field.value}
                          url={avatarUrl}
                          onChange={field.onChange}
                          boxText="Recommended: 400×400px. JPG, PNG or WebP, max 5 MB."
                          className={cn(
                            fieldState.error &&
                              "ring-2 ring-destructive/60",
                          )}
                        />
                        {fieldState.error && (
                          <p className="text-xs text-destructive text-center max-w-[160px] mt-1.5 font-medium">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input id="company-name" {...register("companyName")} />
                      {errors.companyName && (
                        <p className="text-xs text-destructive">
                          {errors.companyName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        defaultValue="Building the future of technology"
                        {...register("tagline")}
                      />
                      {errors.tagline && (
                        <p className="text-xs text-destructive">
                          {errors.tagline.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="about">About the Company</Label>
                    <Textarea
                      id="about"
                      rows={4}
                      defaultValue="TechCorp Inc. is a leading technology company focused on building innovative solutions that help businesses scale. Our platform is used by over 10,000 companies worldwide."
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-xs text-destructive">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Company Details</CardTitle>
              <CardDescription>
                Key information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Industry
                  </Label>
                  <Controller
                    name="industry"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">
                            Manufacturing
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="company-size"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" /> Company Size
                  </Label>
                  <Controller
                    name="teamSize"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">
                            51-200 employees
                          </SelectItem>
                          <SelectItem value="201-500">
                            201-500 employees
                          </SelectItem>
                          <SelectItem value="500-1000">
                            500-1000 employees
                          </SelectItem>
                          <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founded" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Founded Year
                  </Label>
                  <Input
                    id="founded"
                    type="number"
                    defaultValue="2015"
                    {...register("yearOfEstablishment")}
                  />
                  {errors.yearOfEstablishment && (
                    <p className="text-xs text-destructive">
                      {errors.yearOfEstablishment.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="headquarters"
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" /> Headquarters
                  </Label>
                  <Input
                    id="headquarters"
                    defaultValue="San Francisco, CA"
                    {...register("location")}
                  />
                  {errors.location && (
                    <p className="text-xs text-destructive">
                      {errors.location.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Online Presence */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Online Presence</CardTitle>
              <CardDescription>
                Your company&apos;s web and social media links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    defaultValue="https://techcorp.com"
                    {...register("websiteUrl")}
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
                    defaultValue="linkedin.com/company/techcorp"
                    {...register("linkedinUrl")}
                  />
                  {errors.linkedinUrl && (
                    <p className="text-xs text-destructive">
                      {errors.linkedinUrl.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" /> Twitter / X
                  </Label>
                  <Input
                    id="twitter"
                    defaultValue="@techcorp"
                    {...register("twitterUrl")}
                  />
                  {errors.twitterUrl && (
                    <p className="text-xs text-destructive">
                      {errors.twitterUrl.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Culture */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Company Culture</CardTitle>
              <CardDescription>
                Describe what it&apos;s like to work at your company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="culture">Culture & Values</Label>
                <Textarea
                  id="culture"
                  rows={4}
                  defaultValue="At TechCorp, we believe in fostering a collaborative and innovative environment. We value transparency, continuous learning, and work-life balance. Our team is passionate about solving complex problems and making a positive impact."
                  {...register("culture")}
                />
                {errors.culture && (
                  <p className="text-xs text-destructive">
                    {errors.culture.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits & Perks</Label>
                <Textarea
                  id="benefits"
                  rows={4}
                  defaultValue="• Competitive salary and equity package
                                  • Health, dental, and vision insurance
                                  • Flexible work arrangements (remote-friendly)
                                  • Unlimited PTO policy
                                  • Professional development budget
                                  • Home office setup allowance
                                  • 401(k) with company matching"
                  {...register("benefits")}
                />
                {errors.benefits && (
                  <p className="text-xs text-destructive">
                    {errors.benefits.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            {isDirty && (
              <Button variant="outline" onClick={() => reset()}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={!isDirty}>
              {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
};

export default EmployerForm;

type ImageUploadProps = Omit<ComponentProps<"div">, "onChange"> & {
  value?: string;
  url?: string | null;
  boxText?: string;
  onChange: (url: string) => void;
};

export const ImageUpload = ({
  value,
  onChange,
  url,
  className,
  boxText,
  ...props
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(url || null);

  useEffect(() => {
    if (url) {
      setPreviewUrl(url);
    }
  }, [url]);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        onChange(res[0].ufsUrl);
        toast.success("Image uploaded successfully!");
      }
      setIsUploading(false);
      setPreviewUrl(null);
    },
    onUploadError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
      setIsUploading(false);
      setPreviewUrl(null);
    },
  });

  const handleFileSelect = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    await startUpload([file]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileSelect,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setPreviewUrl(null);
  };

  const currentImage = previewUrl || value;

  return (
    <div className="flex flex-col items-center">
      {currentImage ? (
        <div
          className={cn(
            "group relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-border shadow-xs bg-muted/20 transition-all duration-200 hover:border-primary/40 select-none",
            className,
          )}
          {...props}
        >
          <Image
            src={currentImage}
            alt="Company Logo"
            width={128}
            height={128}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {isUploading && (
            <div className="absolute inset-0 bg-background/85 backdrop-blur-xs flex flex-col items-center justify-center gap-1 z-20">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-[11px] font-medium text-foreground">Uploading...</p>
            </div>
          )}

          {!isUploading && (
            <div
              {...getRootProps()}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1.5 z-10 cursor-pointer p-2"
            >
              <input {...getInputProps()} />
              <div className="flex items-center gap-1 text-[11px] font-medium text-white bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full backdrop-blur-xs transition-colors shadow-xs">
                <Camera className="w-3.5 h-3.5" />
                <span>Change</span>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                title="Remove logo"
                className="flex items-center gap-1 text-[10px] font-medium text-red-200 hover:text-white bg-destructive/70 hover:bg-destructive px-2 py-0.5 rounded-full transition-colors shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "group relative flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden select-none",
            isDragActive
              ? "border-primary bg-primary/10 ring-4 ring-primary/20 scale-105"
              : "border-muted-foreground/30 bg-muted/20 hover:border-primary/60 hover:bg-muted/50 hover:shadow-xs",
            isUploading && "pointer-events-none opacity-60",
            className,
          )}
          {...props}
        >
          <input {...getInputProps()} />

          {isUploading ? (
            <div className="flex flex-col items-center justify-center text-center p-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin mb-1.5" />
              <span className="text-[11px] font-medium text-foreground">Uploading...</span>
            </div>
          ) : isDragActive ? (
            <div className="flex flex-col items-center justify-center text-center p-2">
              <Upload className="w-6 h-6 text-primary animate-bounce mb-1" />
              <span className="text-xs font-semibold text-primary">Drop here</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center px-2 py-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background shadow-xs border border-border/70 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 group-hover:border-primary/40 transition-all duration-200 mb-1">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" />
              </div>
              <span className="text-xs font-medium text-foreground/90 group-hover:text-primary transition-colors">
                Upload Logo
              </span>
              <span className="text-[10px] text-muted-foreground">
                Click or drag
              </span>
            </div>
          )}
        </div>
      )}

      {currentImage && !isUploading && (
        <button
          type="button"
          onClick={handleRemove}
          className="mt-2 text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Remove logo</span>
        </button>
      )}

      {boxText && (
        <p className="mt-2 text-[11px] text-muted-foreground text-center max-w-[150px] leading-tight">
          {boxText}
        </p>
      )}
    </div>
  );
};

