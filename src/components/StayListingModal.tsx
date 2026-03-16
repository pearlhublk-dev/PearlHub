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

interface StayListing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  stars: number;
  price_per_night: number;
  location: string;
  lat: number;
  lng: number;
  rooms: number;
  amenities: string[];
  images: string[];
  approved: boolean;
  created_at: string;
  updated_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: StayListing | null;
}

const STAY_TYPES = [
  { value: "star_hotel", label: "Star Hotel" },
  { value: "villa", label: "Villa" },
  { value: "guest_house", label: "Guest House" },
  { value: "hostel", label: "Hostel" },
  { value: "lodge", label: "Lodge" },
];

const AMENITY_OPTIONS = ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Parking", "AC", "Room Service", "Bar", "Beach Access", "Garden", "Laundry"];

const StayListingModal = ({ open, onClose, onSuccess, editData }: Props) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "guest_house",
    stars: 0,
    price_per_night: 0,
    location: "",
    rooms: 1,
    amenities: [] as string[],
    images: [] as string[],
  });

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title,
        description: editData.description || "",
        type: editData.type,
        stars: editData.stars || 0,
        price_per_night: Number(editData.price_per_night),
        location: editData.location,
        rooms: editData.rooms || 1,
        amenities: editData.amenities || [],
        images: editData.images || [],
      });
    } else {
      setForm({ title: "", description: "", type: "guest_house", stars: 0, price_per_night: 0, location: "", rooms: 1, amenities: [], images: [] });
    }
  }, [editData, open]);

  const toggleAmenity = (a: string) => {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.title || !form.location || form.price_per_night <= 0) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      title: form.title,
      description: form.description,
      type: form.type,
      stars: form.stars,
      price_per_night: form.price_per_night,
      location: form.location,
      rooms: form.rooms,
      amenities: form.amenities,
      images: form.images,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editData) {
      ({ error } = await supabase.from("stays_listings").update(payload).eq("id", editData.id));
    } else {
      ({ error } = await supabase.from("stays_listings").insert(payload));
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
          <DialogTitle>{editData ? "Edit Stay" : "List a Stay"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Oceanview Villa" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your stay…" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stars</Label>
              <Input type="number" min={0} max={5} value={form.stars} onChange={e => setForm({ ...form, stars: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price per Night (Rs.) *</Label>
              <Input type="number" min={0} value={form.price_per_night} onChange={e => setForm({ ...form, price_per_night: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Rooms</Label>
              <Input type="number" min={1} value={form.rooms} onChange={e => setForm({ ...form, rooms: parseInt(e.target.value) || 1 })} />
            </div>
          </div>
          <div>
            <Label>Location *</Label>
            <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Galle, Sri Lanka" />
          </div>
          <div>
            <Label className="mb-2 block">Amenities</Label>
            <div className="flex flex-wrap gap-1.5">
              {AMENITY_OPTIONS.map(a => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${form.amenities.includes(a) ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-input"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <ImageUpload bucket="listings" maxFiles={5} onUpload={urls => setForm({ ...form, images: urls })} existingUrls={form.images} label="Photos" />
          <Button onClick={handleSubmit} disabled={saving || !form.title || !form.location || form.price_per_night <= 0} className="w-full">
            {saving && <Loader2 className="animate-spin mr-2" />}
            {editData ? "Update Stay" : "Publish Stay"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StayListingModal;
export type { StayListing };
