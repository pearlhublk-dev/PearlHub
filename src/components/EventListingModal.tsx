import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUpload from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface EventListing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  location: string;
  lat: number;
  lng: number;
  event_date: string;
  event_time: string;
  price_standard: number;
  price_premium: number;
  price_vip: number;
  total_seats: number;
  seat_rows: number;
  seat_cols: number;
  images: string[];
  created_at: string;
  updated_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: EventListing | null;
}

const CATEGORIES = [
  { value: "concert", label: "🎵 Concert" },
  { value: "cinema", label: "🎬 Cinema" },
  { value: "sports", label: "🏏 Sports" },
  { value: "theatre", label: "🎭 Theatre" },
];

const EventListingModal = ({ open, onClose, onSuccess, editData }: Props) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "concert", venue: "", location: "",
    event_date: "", event_time: "19:00",
    price_standard: 0, price_premium: 0, price_vip: 0,
    total_seats: 100, seat_rows: 10, seat_cols: 10,
    images: [] as string[],
  });

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title, description: editData.description || "", category: editData.category,
        venue: editData.venue, location: editData.location,
        event_date: editData.event_date, event_time: editData.event_time,
        price_standard: Number(editData.price_standard), price_premium: Number(editData.price_premium), price_vip: Number(editData.price_vip),
        total_seats: editData.total_seats, seat_rows: editData.seat_rows, seat_cols: editData.seat_cols,
        images: editData.images || [],
      });
    } else {
      setForm({ title: "", description: "", category: "concert", venue: "", location: "", event_date: "", event_time: "19:00", price_standard: 0, price_premium: 0, price_vip: 0, total_seats: 100, seat_rows: 10, seat_cols: 10, images: [] });
    }
  }, [editData, open]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.title || !form.venue || !form.event_date || form.price_standard <= 0) return;
    setSaving(true);
    const payload = {
      user_id: user.id, title: form.title, description: form.description, category: form.category,
      venue: form.venue, location: form.location || form.venue,
      event_date: form.event_date, event_time: form.event_time,
      price_standard: form.price_standard, price_premium: form.price_premium, price_vip: form.price_vip,
      total_seats: form.total_seats, seat_rows: form.seat_rows, seat_cols: form.seat_cols,
      images: form.images, updated_at: new Date().toISOString(),
    };
    let error;
    if (editData) {
      ({ error } = await supabase.from("events_listings").update(payload).eq("id", editData.id));
    } else {
      ({ error } = await supabase.from("events_listings").insert(payload));
    }
    setSaving(false);
    if (error) { console.error(error); return; }
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Event" : "Create an Event"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Event Name *</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Jazz Night at Galle Face" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the event…" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Venue *</Label>
              <Input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="e.g. Nelum Pokuna" />
            </div>
          </div>
          <div>
            <Label>Location</Label>
            <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Colombo, Sri Lanka" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date *</Label><Input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} /></div>
            <div><Label>Time *</Label><Input type="time" value={form.event_time} onChange={e => setForm({ ...form, event_time: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Standard (Rs.) *</Label><Input type="number" min={0} value={form.price_standard} onChange={e => setForm({ ...form, price_standard: parseFloat(e.target.value) || 0 })} /></div>
            <div><Label>Premium (Rs.)</Label><Input type="number" min={0} value={form.price_premium} onChange={e => setForm({ ...form, price_premium: parseFloat(e.target.value) || 0 })} /></div>
            <div><Label>VIP (Rs.)</Label><Input type="number" min={0} value={form.price_vip} onChange={e => setForm({ ...form, price_vip: parseFloat(e.target.value) || 0 })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Total Seats</Label><Input type="number" min={10} value={form.total_seats} onChange={e => setForm({ ...form, total_seats: parseInt(e.target.value) || 100 })} /></div>
            <div><Label>Rows</Label><Input type="number" min={1} value={form.seat_rows} onChange={e => setForm({ ...form, seat_rows: parseInt(e.target.value) || 10 })} /></div>
            <div><Label>Cols</Label><Input type="number" min={1} value={form.seat_cols} onChange={e => setForm({ ...form, seat_cols: parseInt(e.target.value) || 10 })} /></div>
          </div>
          <ImageUpload bucket="listings" maxFiles={5} onUpload={urls => setForm({ ...form, images: urls })} existingUrls={form.images} label="Event Photos" />
          <Button onClick={handleSubmit} disabled={saving || !form.title || !form.venue || !form.event_date || form.price_standard <= 0} className="w-full">
            {saving && <Loader2 className="animate-spin mr-2" />}
            {editData ? "Update Event" : "Publish Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventListingModal;
export type { EventListing };
