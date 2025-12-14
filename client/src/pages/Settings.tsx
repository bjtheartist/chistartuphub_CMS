import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, User, Link as LinkIcon, Settings as SettingsIcon, Bell, Palette, Upload } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { storagePut } from "@/lib/storage";

export default function Settings() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const { data: platforms } = trpc.platforms.list.useQuery();
  
  const [formData, setFormData] = useState({
    // Profile
    bio: "",
    avatarUrl: "",
    // Platform Connections
    linkedinConnected: 0,
    xConnected: 0,
    instagramConnected: 0,
    linkedinApiKey: "",
    xApiKey: "",
    instagramApiKey: "",
    // Content Preferences
    defaultVisibility: "public",
    autoSaveFrequency: 30,
    defaultPlatformId: 1,
    timezone: "America/Chicago",
    // Notifications
    emailNotifications: 1,
    calendarReminders: 1,
    weeklyReports: 1,
    // Brand
    companyLogoUrl: "",
    brandColorPrimary: "#3B82F6",
    brandColorSecondary: "#EAB308",
    defaultHashtags: "[]",
    signatureText: "",
  });

  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        bio: settings.bio || "",
        avatarUrl: settings.avatarUrl || "",
        linkedinConnected: settings.linkedinConnected || 0,
        xConnected: settings.xConnected || 0,
        instagramConnected: settings.instagramConnected || 0,
        linkedinApiKey: settings.linkedinApiKey || "",
        xApiKey: settings.xApiKey || "",
        instagramApiKey: settings.instagramApiKey || "",
        defaultVisibility: settings.defaultVisibility || "public",
        autoSaveFrequency: settings.autoSaveFrequency || 30,
        defaultPlatformId: settings.defaultPlatformId || 1,
        timezone: settings.timezone || "America/Chicago",
        emailNotifications: settings.emailNotifications || 1,
        calendarReminders: settings.calendarReminders || 1,
        weeklyReports: settings.weeklyReports || 1,
        companyLogoUrl: settings.companyLogoUrl || "",
        brandColorPrimary: settings.brandColorPrimary || "#3B82F6",
        brandColorSecondary: settings.brandColorSecondary || "#EAB308",
        defaultHashtags: settings.defaultHashtags || "[]",
        signatureText: settings.signatureText || "",
      });
      
      try {
        const parsedHashtags = JSON.parse(settings.defaultHashtags || "[]");
        setHashtags(parsedHashtags);
      } catch (e) {
        setHashtags([]);
      }
    }
  }, [settings]);

  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved successfully!");
      utils.settings.get.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to save settings: ${error.message}`);
    },
  });

  const handleSave = (section: string) => {
    const updates: any = {};
    
    if (section === "profile") {
      updates.bio = formData.bio;
      updates.avatarUrl = formData.avatarUrl;
    } else if (section === "platforms") {
      updates.linkedinConnected = formData.linkedinConnected;
      updates.xConnected = formData.xConnected;
      updates.instagramConnected = formData.instagramConnected;
      updates.linkedinApiKey = formData.linkedinApiKey;
      updates.xApiKey = formData.xApiKey;
      updates.instagramApiKey = formData.instagramApiKey;
    } else if (section === "content") {
      updates.defaultVisibility = formData.defaultVisibility;
      updates.autoSaveFrequency = formData.autoSaveFrequency;
      updates.defaultPlatformId = formData.defaultPlatformId;
      updates.timezone = formData.timezone;
    } else if (section === "notifications") {
      updates.emailNotifications = formData.emailNotifications;
      updates.calendarReminders = formData.calendarReminders;
      updates.weeklyReports = formData.weeklyReports;
    } else if (section === "brand") {
      updates.companyLogoUrl = formData.companyLogoUrl;
      updates.brandColorPrimary = formData.brandColorPrimary;
      updates.brandColorSecondary = formData.brandColorSecondary;
      updates.defaultHashtags = JSON.stringify(hashtags);
      updates.signatureText = formData.signatureText;
    }
    
    updateMutation.mutate(updates);
  };

  const handleFileUpload = async (file: File, type: "avatar" | "logo") => {
    if (!file) return;
    
    setUploading(true);
    try {
      const result = await storagePut(file);
      
      if (type === "avatar") {
        setFormData({ ...formData, avatarUrl: result.url });
        updateMutation.mutate({ avatarUrl: result.url });
      } else {
        setFormData({ ...formData, companyLogoUrl: result.url });
        updateMutation.mutate({ companyLogoUrl: result.url });
      }
      
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const addHashtag = () => {
    if (newHashtag.trim() && !hashtags.includes(newHashtag.trim())) {
      const tag = newHashtag.trim().startsWith("#") ? newHashtag.trim() : `#${newHashtag.trim()}`;
      setHashtags([...hashtags, tag]);
      setNewHashtag("");
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(h => h !== tag));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
            Settings
          </h1>
          <p className="text-gray-600 font-mono text-sm md:text-base">
            Manage your profile, connections, and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl border-2 border-black">
            <TabsTrigger value="profile" className="font-mono font-bold uppercase text-xs">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="platforms" className="font-mono font-bold uppercase text-xs">
              <LinkIcon className="w-4 h-4 mr-2" />
              Platforms
            </TabsTrigger>
            <TabsTrigger value="content" className="font-mono font-bold uppercase text-xs">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="notifications" className="font-mono font-bold uppercase text-xs">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="brand" className="font-mono font-bold uppercase text-xs">
              <Palette className="w-4 h-4 mr-2" />
              Brand
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black uppercase mb-6">Profile Settings</h2>
              
              <div className="space-y-6">
                {/* User Info (Read-only) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-mono font-bold uppercase text-sm">Name</Label>
                    <Input
                      value={user?.name || ""}
                      disabled
                      className="border-2 border-black font-mono bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1 font-mono">Managed by OAuth provider</p>
                  </div>
                  <div>
                    <Label className="font-mono font-bold uppercase text-sm">Email</Label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="border-2 border-black font-mono bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1 font-mono">Managed by OAuth provider</p>
                  </div>
                </div>

                {/* Avatar Upload */}
                <div>
                  <Label className="font-mono font-bold uppercase text-sm">Profile Picture</Label>
                  <div className="flex items-center gap-4 mt-2">
                    {formData.avatarUrl && (
                      <img
                        src={formData.avatarUrl}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full border-4 border-black object-cover"
                      />
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        id="avatar-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "avatar");
                        }}
                      />
                      <Button
                        onClick={() => document.getElementById("avatar-upload")?.click()}
                        disabled={uploading}
                        className="bg-white text-black border-2 border-black font-mono font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Upload Image
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <Label className="font-mono font-bold uppercase text-sm">Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="border-2 border-black font-mono text-sm mt-2"
                  />
                </div>

                <Button
                  onClick={() => handleSave("profile")}
                  disabled={updateMutation.isPending}
                  className="bg-black text-white font-mono font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Profile
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Platform Connections */}
          <TabsContent value="platforms">
            <Card className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black uppercase mb-6">Platform Connections</h2>
              
              <div className="space-y-6">
                {/* LinkedIn */}
                <div className="p-4 border-2 border-black bg-blue-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
                        in
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">LinkedIn</h3>
                        <p className="text-sm text-gray-600 font-mono">
                          {formData.linkedinConnected ? "Connected" : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.linkedinConnected === 1}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, linkedinConnected: checked ? 1 : 0 })
                      }
                    />
                  </div>
                  {formData.linkedinConnected === 1 && (
                    <div>
                      <Label className="font-mono font-bold uppercase text-xs">API Key</Label>
                      <Input
                        type="password"
                        value={formData.linkedinApiKey}
                        onChange={(e) => setFormData({ ...formData, linkedinApiKey: e.target.value })}
                        placeholder="Enter LinkedIn API key..."
                        className="border-2 border-black font-mono text-sm mt-2"
                      />
                    </div>
                  )}
                </div>

                {/* X (Twitter) */}
                <div className="p-4 border-2 border-black bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-black rounded flex items-center justify-center text-white font-bold">
                        𝕏
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">X (Twitter)</h3>
                        <p className="text-sm text-gray-600 font-mono">
                          {formData.xConnected ? "Connected" : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.xConnected === 1}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, xConnected: checked ? 1 : 0 })
                      }
                    />
                  </div>
                  {formData.xConnected === 1 && (
                    <div>
                      <Label className="font-mono font-bold uppercase text-xs">API Key</Label>
                      <Input
                        type="password"
                        value={formData.xApiKey}
                        onChange={(e) => setFormData({ ...formData, xApiKey: e.target.value })}
                        placeholder="Enter X API key..."
                        className="border-2 border-black font-mono text-sm mt-2"
                      />
                    </div>
                  )}
                </div>

                {/* Instagram */}
                <div className="p-4 border-2 border-black bg-pink-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded flex items-center justify-center text-white font-bold">
                        IG
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Instagram</h3>
                        <p className="text-sm text-gray-600 font-mono">
                          {formData.instagramConnected ? "Connected" : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.instagramConnected === 1}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, instagramConnected: checked ? 1 : 0 })
                      }
                    />
                  </div>
                  {formData.instagramConnected === 1 && (
                    <div>
                      <Label className="font-mono font-bold uppercase text-xs">API Key</Label>
                      <Input
                        type="password"
                        value={formData.instagramApiKey}
                        onChange={(e) => setFormData({ ...formData, instagramApiKey: e.target.value })}
                        placeholder="Enter Instagram API key..."
                        className="border-2 border-black font-mono text-sm mt-2"
                      />
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleSave("platforms")}
                  disabled={updateMutation.isPending}
                  className="bg-black text-white font-mono font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Connections
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Content Preferences */}
          <TabsContent value="content">
            <Card className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black uppercase mb-6">Content Preferences</h2>
              
              <div className="space-y-6">
                {/* Default Platform */}
                <div>
                  <Label className="font-mono font-bold uppercase text-sm">Default Platform</Label>
                  <select
                    value={formData.defaultPlatformId}
                    onChange={(e) => setFormData({ ...formData, defaultPlatformId: parseInt(e.target.value) })}
                    className="w-full border-2 border-black p-2 font-mono text-sm bg-white mt-2"
                  >
                    {platforms?.map((platform) => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Default Visibility */}
                <div>
                  <Label className="font-mono font-bold uppercase text-sm">Default Post Visibility</Label>
                  <select
                    value={formData.defaultVisibility}
                    onChange={(e) => setFormData({ ...formData, defaultVisibility: e.target.value })}
                    className="w-full border-2 border-black p-2 font-mono text-sm bg-white mt-2"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                  </select>
                </div>

                {/* Auto-save Frequency */}
                <div>
                  <Label className="font-mono font-bold uppercase text-sm">
                    Auto-save Frequency (seconds)
                  </Label>
                  <Input
                    type="number"
                    value={formData.autoSaveFrequency}
                    onChange={(e) => setFormData({ ...formData, autoSaveFrequency: parseInt(e.target.value) })}
                    min={10}
                    max={300}
                    className="border-2 border-black font-mono mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    Drafts will auto-save every {formData.autoSaveFrequency} seconds
                  </p>
                </div>

                {/* Timezone */}
                <div>
                  <Label className="font-mono font-bold uppercase text-sm">Timezone</Label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full border-2 border-black p-2 font-mono text-sm bg-white mt-2"
                  >
                    <option value="America/Chicago">Central Time (Chicago)</option>
                    <option value="America/New_York">Eastern Time (New York)</option>
                    <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                    <option value="America/Denver">Mountain Time (Denver)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <Button
                  onClick={() => handleSave("content")}
                  disabled={updateMutation.isPending}
                  className="bg-black text-white font-mono font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Preferences
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black uppercase mb-6">Notification Settings</h2>
              
              <div className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 border-2 border-black">
                  <div>
                    <h3 className="font-bold text-lg">Email Notifications</h3>
                    <p className="text-sm text-gray-600 font-mono">
                      Receive email alerts for scheduled posts
                    </p>
                  </div>
                  <Switch
                    checked={formData.emailNotifications === 1}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, emailNotifications: checked ? 1 : 0 })
                    }
                  />
                </div>

                {/* Calendar Reminders */}
                <div className="flex items-center justify-between p-4 border-2 border-black">
                  <div>
                    <h3 className="font-bold text-lg">Calendar Reminders</h3>
                    <p className="text-sm text-gray-600 font-mono">
                      Get reminders for upcoming content deadlines
                    </p>
                  </div>
                  <Switch
                    checked={formData.calendarReminders === 1}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, calendarReminders: checked ? 1 : 0 })
                    }
                  />
                </div>

                {/* Weekly Reports */}
                <div className="flex items-center justify-between p-4 border-2 border-black">
                  <div>
                    <h3 className="font-bold text-lg">Weekly Performance Reports</h3>
                    <p className="text-sm text-gray-600 font-mono">
                      Receive weekly analytics and performance summaries
                    </p>
                  </div>
                  <Switch
                    checked={formData.weeklyReports === 1}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, weeklyReports: checked ? 1 : 0 })
                    }
                  />
                </div>

                <Button
                  onClick={() => handleSave("notifications")}
                  disabled={updateMutation.isPending}
                  className="bg-black text-white font-mono font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Notifications
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Brand Settings */}
          <TabsContent value="brand">
            <Card className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black uppercase mb-6">Brand Settings</h2>
              
              <div className="space-y-6">
                {/* Company Logo */}
                <div>
                  <Label className="font-mono font-bold uppercase text-sm">Company Logo</Label>
                  <div className="flex items-center gap-4 mt-2">
                    {formData.companyLogoUrl && (
                      <img
                        src={formData.companyLogoUrl}
                        alt="Logo"
                        className="w-32 h-32 border-4 border-black object-contain bg-white p-2"
                      />
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        id="logo-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "logo");
                        }}
                      />
                      <Button
                        onClick={() => document.getElementById("logo-upload")?.click()}
                        disabled={uploading}
                        className="bg-white text-black border-2 border-black font-mono font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Brand Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-mono font-bold uppercase text-sm">Primary Brand Color</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="color"
                        value={formData.brandColorPrimary}
                        onChange={(e) => setFormData({ ...formData, brandColorPrimary: e.target.value })}
                        className="w-16 h-10 border-2 border-black cursor-pointer"
                      />
                      <Input
                        value={formData.brandColorPrimary}
                        onChange={(e) => setFormData({ ...formData, brandColorPrimary: e.target.value })}
                        className="border-2 border-black font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="font-mono font-bold uppercase text-sm">Secondary Brand Color</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="color"
                        value={formData.brandColorSecondary}
                        onChange={(e) => setFormData({ ...formData, brandColorSecondary: e.target.value })}
                        className="w-16 h-10 border-2 border-black cursor-pointer"
                      />
                      <Input
                        value={formData.brandColorSecondary}
                        onChange={(e) => setFormData({ ...formData, brandColorSecondary: e.target.value })}
                        className="border-2 border-black font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Default Hashtags */}
                <div>
                  <Label className="font-mono font-bold uppercase text-sm">Default Hashtags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newHashtag}
                      onChange={(e) => setNewHashtag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addHashtag()}
                      placeholder="Add hashtag..."
                      className="border-2 border-black font-mono"
                    />
                    <Button
                      onClick={addHashtag}
                      className="bg-yellow-400 text-black border-2 border-black font-mono font-bold"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-black text-white font-mono text-sm border-2 border-black flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => removeHashtag(tag)}
                          className="text-red-400 hover:text-red-600 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Signature Text */}
                <div>
                  <Label className="font-mono font-bold uppercase text-sm">Post Signature</Label>
                  <Textarea
                    value={formData.signatureText}
                    onChange={(e) => setFormData({ ...formData, signatureText: e.target.value })}
                    placeholder="Automatically appended to posts..."
                    rows={3}
                    className="border-2 border-black font-mono text-sm mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    This text will be added to the end of your posts
                  </p>
                </div>

                <Button
                  onClick={() => handleSave("brand")}
                  disabled={updateMutation.isPending}
                  className="bg-black text-white font-mono font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Brand Settings
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
