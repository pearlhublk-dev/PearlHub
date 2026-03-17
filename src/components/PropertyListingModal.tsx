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

export interface PropertyListing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  subtype: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
  location: string;
  lat: number;
  lng: number;
  images: string[];
  moderation_status: string;
  active: boolean;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: PropertyListing | null;
}

const PROPERTY_TYPES = [
  { value: "sale", label: "Sale" },
  { value: "rent", label: "Rent" },
  { value: "lease", label: "Lease" },
];

const SUBTYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
];

const PropertyListingModal = ({ open, onClose, onSuccess, editData }: Props) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "sale",
    subtype: "house",
    price: 0,
    beds: 0,
    baths: 0,
    area: 0,
    location: "",
    lat: 7.8731,
    lng: 80.7718,
    images: [] as string[],
  });

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title,
        description: editData.description || "",
        type: editData.type,
        subtype: editData.subtype || "house",
        price: Number(editData.price),
        beds: editData.beds || 0,
        baths: editData.baths || 0,
        area: editData.area || 0,
        location: editData.location || "",
        lat: editData.lat || 7.8731,
        lng: editData.lng || 80.7718,
        images: editData.images || [],
      });
    } else {
      setForm({
        title: "",
        description: "",
        type: "sale",
        subtype: "house",
        price: 0,
        beds: 0,
        baths: 0,
        area: 0,
        location: "",
        lat: 7.8731,
        lng: 80.7718,
        images: [],
      });
    }
  }, [editData, open]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.title || !form.location || form.price <= 0) return;
    setSaving(true);

    const payload = {
      user_id: user.id,
      title: form.title,
      description: form.description,
      type: form.type,
      subtype: form.subtype,
      price: form.price,
      beds: form.beds,
      baths: form.baths,
      area: form.area,
      location: form.location,
      lat: form.lat,
      lng: form.lng,
      images: form.images,
      moderation_status: editData ? editData.moderation_status : "pending",
      active: editData ? editData.active : true,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editData) {
      ({ error } = await supabase.from("properties_listings").update(payload).eq("id", editData.id));
    } else {
      ({ error } = await supabase.from("properties_listings").insert(payload));
    }

    setSaving(false);
    if (error) {
      console.error(error);
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Property" : "List a Property"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Modern 3BR apartment in Colombo 2" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the property…" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subtype</Label>
              <Select value={form.subtype} onValueChange={(v) => setForm({ ...form, subtype: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUBTYPES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price (Rs.) *</Label>
              <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Area (sq ft)</Label>
              <Input type="number" min={0} value={form.area} onChange={(e) => setForm({ ...form, area: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Beds</Label>
              <Input type="number" min={0} value={form.beds} onChange={(e) => setForm({ ...form, beds: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Baths</Label>
              <Input type="number" min={0} value={form.baths} onChange={(e) => setForm({ ...form, baths: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Location *</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Colombo 2" />
            </div>
          </div>

          <ImageUpload bucket="listings" maxFiles={5} onUpload={(urls) => setForm({ ...form, images: urls })} existingUrls={form.images} label="Property Images" />

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={saving || !form.title || !form.location || form.price <= 0} className="flex-1">
              {saving && <Loader2 className="animate-spin mr-2" />}
              {editData ? "Update Property" : "Publish Property"}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyListingModal;
