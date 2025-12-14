import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Target, TrendingUp, CheckCircle2, Pause, X, CalendarIcon, Loader2, Edit } from "lucide-react";
import { format } from "date-fns";

interface GoalFormData {
  title: string;
  description: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  targetValue: number;
  metricType: string;
  startDate: Date;
  endDate: Date;
}

export default function Goals() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"active" | "completed" | "paused" | "cancelled" | "all">("active");
  const [formData, setFormData] = useState<GoalFormData>({
    title: "",
    description: "",
    specific: "",
    measurable: "",
    achievable: "",
    relevant: "",
    timeBound: "",
    targetValue: 0,
    metricType: "posts",
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
  });

  const { data: goals, isLoading, refetch } = trpc.goals.list.useQuery(
    filter !== "all" ? { status: filter } : undefined
  );

  const createMutation = trpc.goals.create.useMutation({
    onSuccess: () => {
      toast.success("Goal created successfully!");
      setCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create goal: ${error.message}`);
    },
  });

  const updateMutation = trpc.goals.update.useMutation({
    onSuccess: () => {
      toast.success("Goal updated successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update goal: ${error.message}`);
    },
  });

  const deleteMutation = trpc.goals.delete.useMutation({
    onSuccess: () => {
      toast.success("Goal deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete goal: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      specific: "",
      measurable: "",
      achievable: "",
      relevant: "",
      timeBound: "",
      targetValue: 0,
      metricType: "posts",
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a goal title");
      return;
    }
    if (!formData.specific.trim()) {
      toast.error("Please describe what you want to achieve (Specific)");
      return;
    }
    if (!formData.measurable.trim()) {
      toast.error("Please describe how you'll measure success (Measurable)");
      return;
    }

    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      specific: formData.specific,
      measurable: formData.measurable,
      achievable: formData.achievable,
      relevant: formData.relevant,
      timeBound: formData.timeBound,
      targetValue: formData.targetValue,
      metricType: formData.metricType,
      startDate: formData.startDate,
      endDate: formData.endDate,
    });
  };

  const handleStatusChange = (goalId: number, newStatus: "active" | "completed" | "paused" | "cancelled") => {
    updateMutation.mutate({ id: goalId, status: newStatus });
  };

  const handleDelete = (goalId: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate({ id: goalId });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-blue-500",
      completed: "bg-green-500",
      paused: "bg-yellow-500",
      cancelled: "bg-red-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: TrendingUp,
      completed: CheckCircle2,
      paused: Pause,
      cancelled: X,
    };
    const Icon = icons[status as keyof typeof icons] || Target;
    return <Icon className="w-4 h-4" />;
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const activeGoals = goals?.filter(g => g.status === "active") || [];
  const completedGoals = goals?.filter(g => g.status === "completed") || [];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
              SMART Goals
            </h1>
            <p className="text-gray-600 font-mono text-sm md:text-base">
              Track quarterly objectives with measurable outcomes.
            </p>
          </div>
          <button onClick={() => setCreateDialogOpen(true)} className="neo-btn flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Goal
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="neo-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 border-2 border-black">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-mono text-sm text-gray-500 uppercase">Active Goals</p>
                <p className="text-3xl font-black">{activeGoals.length}</p>
              </div>
            </div>
          </Card>
          <Card className="neo-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 border-2 border-black">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-mono text-sm text-gray-500 uppercase">Completed</p>
                <p className="text-3xl font-black">{completedGoals.length}</p>
              </div>
            </div>
          </Card>
          <Card className="neo-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-yellow border-2 border-black">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="font-mono text-sm text-gray-500 uppercase">Success Rate</p>
                <p className="text-3xl font-black">
                  {activeGoals.length + completedGoals.length > 0
                    ? Math.round((completedGoals.length / (activeGoals.length + completedGoals.length)) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["all", "active", "completed", "paused", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`
                px-4 py-2 font-mono font-bold uppercase text-sm border-2 border-black transition-all whitespace-nowrap
                ${filter === f 
                  ? "bg-black text-white shadow-[2px_2px_0px_0px_#FCD34D]" 
                  : "bg-white text-black hover:bg-gray-100"}
              `}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Goals List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : goals && goals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const progress = calculateProgress(goal.currentValue || 0, goal.targetValue || 0);
              const daysRemaining = Math.ceil((new Date(goal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

              return (
                <Card key={goal.id} className="neo-card p-6 relative">
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 ${getStatusColor(goal.status)} text-white font-mono text-xs font-bold uppercase flex items-center gap-1 border border-black`}>
                    {getStatusIcon(goal.status)}
                    {goal.status}
                  </div>

                  {/* Goal Header */}
                  <div className="mb-4 pr-24">
                    <h3 className="text-2xl font-black mb-2">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    )}
                  </div>

                  {/* Progress */}
                  {goal.targetValue && goal.targetValue > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-sm font-bold">Progress</span>
                        <span className="font-mono text-sm">
                          {goal.currentValue || 0} / {goal.targetValue} {goal.metricType}
                        </span>
                      </div>
                      <Progress value={progress} className="h-3 border-2 border-black" />
                      <p className="text-xs font-mono text-gray-500 mt-1">{progress}% Complete</p>
                    </div>
                  )}

                  {/* SMART Criteria */}
                  <div className="space-y-2 mb-4 text-sm">
                    {goal.specific && (
                      <div className="flex gap-2">
                        <span className="font-mono font-bold text-brand-blue">S:</span>
                        <span className="text-gray-700">{goal.specific}</span>
                      </div>
                    )}
                    {goal.measurable && (
                      <div className="flex gap-2">
                        <span className="font-mono font-bold text-brand-blue">M:</span>
                        <span className="text-gray-700">{goal.measurable}</span>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center gap-4 text-xs font-mono text-gray-500 mb-4 pb-4 border-b-2 border-gray-100">
                    <div>
                      <span className="font-bold">Start:</span> {format(new Date(goal.startDate), "MMM d, yyyy")}
                    </div>
                    <div>
                      <span className="font-bold">End:</span> {format(new Date(goal.endDate), "MMM d, yyyy")}
                    </div>
                    {daysRemaining > 0 && goal.status === "active" && (
                      <div className="ml-auto">
                        <span className="font-bold">{daysRemaining} days left</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {goal.status === "active" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(goal.id, "completed")}
                          className="font-mono text-xs"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(goal.id, "paused")}
                          className="font-mono text-xs"
                        >
                          <Pause className="w-3 h-3 mr-1" /> Pause
                        </Button>
                      </>
                    )}
                    {goal.status === "paused" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(goal.id, "active")}
                        className="font-mono text-xs"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" /> Resume
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(goal.id, goal.title)}
                      className="font-mono text-xs ml-auto"
                    >
                      <X className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="neo-card p-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="font-bold text-xl mb-2">No Goals Yet</h3>
            <p className="text-gray-600 mb-4">Create your first SMART goal to start tracking progress</p>
            <button onClick={() => setCreateDialogOpen(true)} className="neo-btn">
              Create Goal
            </button>
          </Card>
        )}

        {/* Create Goal Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono font-bold uppercase text-xl">Create SMART Goal</DialogTitle>
              <p className="text-sm text-gray-600">Define a Specific, Measurable, Achievable, Relevant, and Time-bound goal</p>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div>
                <Label htmlFor="title" className="font-mono font-bold uppercase text-sm mb-2 block">
                  Goal Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Grow LinkedIn following to 10K"
                  className="border-2 border-black font-bold"
                />
              </div>

              <div>
                <Label htmlFor="description" className="font-mono font-bold uppercase text-sm mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief overview of this goal..."
                  className="border-2 border-black"
                  rows={2}
                />
              </div>

              {/* SMART Criteria */}
              <div className="border-2 border-black p-4 bg-gray-50">
                <h4 className="font-mono font-bold uppercase text-sm mb-4">SMART Criteria</h4>
                
                <div className="space-y-4">
                  <div>
                    <Label className="font-mono font-bold text-xs mb-2 block flex items-center gap-2">
                      <span className="bg-brand-blue text-white px-2 py-0.5">S</span> Specific *
                    </Label>
                    <Textarea
                      value={formData.specific}
                      onChange={(e) => setFormData(prev => ({ ...prev, specific: e.target.value }))}
                      placeholder="What exactly do you want to achieve?"
                      className="border-2 border-black text-sm"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label className="font-mono font-bold text-xs mb-2 block flex items-center gap-2">
                      <span className="bg-brand-blue text-white px-2 py-0.5">M</span> Measurable *
                    </Label>
                    <Textarea
                      value={formData.measurable}
                      onChange={(e) => setFormData(prev => ({ ...prev, measurable: e.target.value }))}
                      placeholder="How will you measure success?"
                      className="border-2 border-black text-sm"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label className="font-mono font-bold text-xs mb-2 block flex items-center gap-2">
                      <span className="bg-brand-blue text-white px-2 py-0.5">A</span> Achievable
                    </Label>
                    <Textarea
                      value={formData.achievable}
                      onChange={(e) => setFormData(prev => ({ ...prev, achievable: e.target.value }))}
                      placeholder="Is this realistic? What resources do you have?"
                      className="border-2 border-black text-sm"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label className="font-mono font-bold text-xs mb-2 block flex items-center gap-2">
                      <span className="bg-brand-blue text-white px-2 py-0.5">R</span> Relevant
                    </Label>
                    <Textarea
                      value={formData.relevant}
                      onChange={(e) => setFormData(prev => ({ ...prev, relevant: e.target.value }))}
                      placeholder="Why is this goal important?"
                      className="border-2 border-black text-sm"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label className="font-mono font-bold text-xs mb-2 block flex items-center gap-2">
                      <span className="bg-brand-blue text-white px-2 py-0.5">T</span> Time-bound
                    </Label>
                    <Textarea
                      value={formData.timeBound}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeBound: e.target.value }))}
                      placeholder="When will you achieve this?"
                      className="border-2 border-black text-sm"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetValue" className="font-mono font-bold uppercase text-sm mb-2 block">
                    Target Value
                  </Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 0 }))}
                    className="border-2 border-black"
                  />
                </div>

                <div>
                  <Label htmlFor="metricType" className="font-mono font-bold uppercase text-sm mb-2 block">
                    Metric Type
                  </Label>
                  <Select
                    value={formData.metricType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, metricType: value }))}
                  >
                    <SelectTrigger className="border-2 border-black font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="posts">Posts</SelectItem>
                      <SelectItem value="followers">Followers</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="reach">Reach</SelectItem>
                      <SelectItem value="conversions">Conversions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-mono font-bold uppercase text-sm mb-2 block">
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-mono border-2 border-black"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.startDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="font-mono font-bold uppercase text-sm mb-2 block">
                    End Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-mono border-2 border-black"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.endDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => date && setFormData(prev => ({ ...prev, endDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  resetForm();
                }}
                className="font-mono font-bold"
              >
                Cancel
              </Button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="neo-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    Create Goal
                  </>
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
