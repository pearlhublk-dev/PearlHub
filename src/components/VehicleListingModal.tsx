import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUpload from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface VehicleListing {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  price: number;
  price_unit: string;
  seats: number;
  ac: boolean;
  driver: string;
  fuel: string;
  location: string;
  lat: number;
  lng: number;
  images: string[];
  created_at: string;
  updated_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: VehicleListing | null;
}

const VEHICLE_TYPES = [
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "jeep", label: "Jeep" },
  { value: "bus", label: "Bus" },
  { value: "luxury_coach", label: "Luxury Coach" },
];

const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"];

const VehicleListingModal = ({ open, onClose, onSuccess, editData }: Props) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    make: "", model: "", year: 2024, type: "car", price: 0, price_unit: "day",
    seats: 4, ac: true, driver: "optional", fuel: "Petrol", location: "", images: [] as string[],
  });

  useEffect(() => {
    if (editData) {
      setForm({
        make: editData.make, model: editData.model, year: editData.year, type: editData.type,
        price: Number(editData.price), price_unit: editData.price_unit, seats: editData.seats,
        ac: editData.ac, driver: editData.driver, fuel: editData.fuel, location: editData.location,
        images: editData.images || [],
      });
    } else {
      setForm({ make: "", model: "", year: 2024, type: "car", price: 0, price_unit: "day", seats: 4, ac: true, driver: "optional", fuel: "Petrol", location: "", images: [] });
    }
  }, [editData, open]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.make || !form.model || !form.location || form.price <= 0) return;
    setSaving(true);
    const payload = {
      user_id: user.id, make: form.make, model: form.model, year: form.year, type: form.type,
      price: form.price, price_unit: form.price_unit, seats: form.seats, ac: form.ac,
      driver: form.driver, fuel: form.fuel, location: form.location, images: form.images,
      updated_at: new Date().toISOString(),
    };
    let error;
    if (editData) {
      ({ error } = await supabase.from("vehicles_listings").update(payload).eq("id", editData.id));
    } else {
      ({ error } = await supabase.from("vehicles_listings").insert(payload));
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
          <DialogTitle>{editData ? "Edit Vehicle" : "List a Vehicle"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Make *</Label><Input value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} placeholder="Toyota" /></div>
            <div><Label>Model *</Label><Input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Prius" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Year</Label><Input type="number" min={2000} max={2030} value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) || 2024 })} /></div>
            <div>
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{VEHICLE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fuel</Label>
              <Select value={form.fuel} onValueChange={v => setForm({ ...form, fuel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FUEL_TYPES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Daily Rate (Rs.) *</Label><Input type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} /></div>
            <div><Label>Seats</Label><Input type="number" min={1} max={60} value={form.seats} onChange={e => setForm({ ...form, seats: parseInt(e.target.value) || 4 })} /></div>
          </div>
          <div>
            <Label>Location *</Label>
            <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Colombo, Sri Lanka" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Driver</Label>
              <Select value={form.driver} onValueChange={v => setForm({ ...form, driver: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="optional">Self Drive (Optional)</SelectItem>
                  <SelectItem value="included">Driver Included</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 pb-1">
              <Checkbox id="ac" checked={form.ac} onCheckedChange={v => setForm({ ...form, ac: !!v })} />
              <Label htmlFor="ac">Air Conditioning</Label>
            </div>
          </div>
          <ImageUpload bucket="listings" maxFiles={5} onUpload={urls => setForm({ ...form, images: urls })} existingUrls={form.images} label="Vehicle Photos" />
          <Button onClick={handleSubmit} disabled={saving || !form.make || !form.model || !form.location || form.price <= 0} className="w-full">
            {saving && <Loader2 className="animate-spin mr-2" />}
            {editData ? "Update Vehicle" : "Publish Vehicle"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleListingModal;
export type { VehicleListing };
