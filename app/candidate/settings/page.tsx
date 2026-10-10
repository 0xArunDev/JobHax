"use client"

import { useEffect, useState, useTransition } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User,
  Lock,
  Bell,
  Shield,
  Trash2,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { 
    fetchApplicantSettingsAction,
    updateCandidateAccount,
    changeCandidatePassword,
    updateApplicantNotificationPreferences,
    updateApplicantPrivacySettings
} from "@/features/candidate-features/candidate.actions"

export default function CandidateSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [accountData, setAccountData] = useState({ name: "", userName: "", email: "", phoneNumber: "" })
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [notifications, setNotifications] = useState({ jobMatches: true, applicationUpdates: true, interviewReminders: true, profileViews: false, marketingEmails: false })
  const [privacy, setPrivacy] = useState({ profileVisible: true, showContactInfo: true, openToWork: true })

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchApplicantSettingsAction();
        if (res.status === "SUCCESS" && res.data) {
          setAccountData(res.data.account);
          setNotifications(res.data.notifications);
          setPrivacy(res.data.privacy);
        }
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [])

  const handleSaveAccount = () => {
      startTransition(async () => {
          const res = await updateCandidateAccount(accountData);
          if (res.status === "SUCCESS") toast.success(res.message);
          else toast.error(res.message);
      });
  }

  const handleSavePassword = () => {
      startTransition(async () => {
          const res = await changeCandidatePassword(passwordData);
          if (res.status === "SUCCESS") {
              toast.success(res.message);
              setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
          } else toast.error(res.message);
      });
  }

  const handleSaveNotifications = () => {
      startTransition(async () => {
          const res = await updateApplicantNotificationPreferences(notifications);
          if (res.status === "SUCCESS") toast.success(res.message);
          else toast.error(res.message);
      });
  }

  const handleSavePrivacy = () => {
      startTransition(async () => {
          const res = await updateApplicantPrivacySettings(privacy);
          if (res.status === "SUCCESS") toast.success(res.message);
          else toast.error(res.message);
      });
  }

  if (loading) {
      return (
          <div className="flex min-h-screen">
              <DashboardSidebar userType="candidate" userName="" userEmail="" />
              <main className="flex-1 overflow-auto flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </main>
          </div>
      )
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar 
        userType="candidate" 
        userName={accountData.name} 
        userEmail={accountData.email} 
      />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 lg:p-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="account" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Password</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Full Name</Label>
                      <Input id="fullname" value={accountData.name} onChange={(e) => setAccountData({...accountData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" value={accountData.userName} onChange={(e) => setAccountData({...accountData, userName: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={accountData.email} onChange={(e) => setAccountData({...accountData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" value={accountData.phoneNumber} onChange={(e) => setAccountData({...accountData, phoneNumber: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveAccount} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Password Tab */}
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input 
                        id="currentPassword" 
                        type={showCurrentPassword ? "text" : "password"} 
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input 
                        id="newPassword" 
                        type={showNewPassword ? "text" : "password"} 
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input 
                          id="confirmPassword" 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="Confirm new password" 
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSavePassword} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Email Notifications</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">New Job Matches</p>
                          <p className="text-sm text-muted-foreground">Get notified when new jobs match your profile</p>
                        </div>
                        <Switch checked={notifications.jobMatches} onCheckedChange={(c) => setNotifications({...notifications, jobMatches: c})} />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Application Updates</p>
                          <p className="text-sm text-muted-foreground">Status changes on your applications</p>
                        </div>
                        <Switch checked={notifications.applicationUpdates} onCheckedChange={(c) => setNotifications({...notifications, applicationUpdates: c})} />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Interview Reminders</p>
                          <p className="text-sm text-muted-foreground">Reminders before scheduled interviews</p>
                        </div>
                        <Switch checked={notifications.interviewReminders} onCheckedChange={(c) => setNotifications({...notifications, interviewReminders: c})} />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Profile Views</p>
                          <p className="text-sm text-muted-foreground">When employers view your profile</p>
                        </div>
                        <Switch checked={notifications.profileViews} onCheckedChange={(c) => setNotifications({...notifications, profileViews: c})} />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Marketing Emails</p>
                          <p className="text-sm text-muted-foreground">Tips, news, and product updates</p>
                        </div>
                        <Switch checked={notifications.marketingEmails} onCheckedChange={(c) => setNotifications({...notifications, marketingEmails: c})} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Control who can see your profile</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Profile Visibility</p>
                        <p className="text-sm text-muted-foreground">Allow employers to find your profile</p>
                      </div>
                      <Switch checked={privacy.profileVisible} onCheckedChange={(c) => setPrivacy({...privacy, profileVisible: c})} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Show Contact Info</p>
                        <p className="text-sm text-muted-foreground">Display your email and phone to employers</p>
                      </div>
                      <Switch checked={privacy.showContactInfo} onCheckedChange={(c) => setPrivacy({...privacy, showContactInfo: c})} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Open to Work Badge</p>
                        <p className="text-sm text-muted-foreground">Show that you&apos;re actively job searching</p>
                      </div>
                      <Switch checked={privacy.openToWork} onCheckedChange={(c) => setPrivacy({...privacy, openToWork: c})} />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSavePrivacy} disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Privacy Settings
                        </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions for your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Delete Account</p>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
