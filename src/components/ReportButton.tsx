import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Flag } from "lucide-react";

interface ReportButtonProps {
  listingId: string;
  listingType: string;
  reportedUserId?: string;
}

const ReportButton = ({ listingId, listingType, reportedUserId }: ReportButtonProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !reportType || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('user_reports').insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      listing_id: listingId,
      listing_type: listingType,
      report_type: reportType,
      description: description.trim()
    });

    setSubmitting(false);

    if (error) {
      toast.error("Failed to submit report");
      return;
    }

    toast.success("Report submitted successfully");
    setIsOpen(false);
    setReportType("");
    setDescription("");
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-muted-foreground hover:text-destructive">
          <Flag className="w-4 h-4 mr-1" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Listing</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="fraud">Fraud</SelectItem>
                <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                <SelectItem value="fake_listing">Fake Listing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Please describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportButton;