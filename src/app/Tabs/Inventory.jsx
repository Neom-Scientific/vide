'use client';

import { Search } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

// const inventoryItems = [
//   { sku: "NTDC250", kit_name: "NEOTYPER BLOOD EXTRACTION KIT", manufacturer: "Neom Scientific Private Limited", group_classification: "Extraction-Clinical", number_of_rxn: 250, purchase_price: "76,000", mrp: "85,120.00" },
//   { sku: "NTDC125", kit_name: "NEOTYPER BLOOD EXTRACTION KIT", manufacturer: "Neom Scientific Private Limited", group_classification: "Extraction-Clinical", number_of_rxn: 125, purchase_price: "41,800", mrp: "46,816.00" },
//   { sku: "NTDC25", kit_name: "NEOTYPER BLOOD EXTRACTION KIT", manufacturer: "Neom Scientific Private Limited", group_classification: "Extraction-Clinical", number_of_rxn: 24, purchase_price: "10,128", mrp: "11,343.88" },
//   { sku: "NTTC250", kit_name: "NEOTYPER TISSUE EXTRACTION KIT", manufacturer: "Neom Scientific Private Limited", group_classification: "Extraction-Clinical", number_of_rxn: 250, purchase_price: "120,000", mrp: "134,400.00" },
//   { sku: "NTTC125", kit_name: "NEOTYPER TISSUE EXTRACTION KIT", manufacturer: "Neom Scientific Private Limited", group_classification: "Extraction-Clinical", number_of_rxn: 125, purchase_price: "66,000", mrp: "73,920.00" },
//   { sku: "NTTC24", kit_name: "NEOTYPER TISSUE EXTRACTION KIT", manufacturer: "Neom Scientific Private Limited", group_classification: "Extraction-Clinical", number_of_rxn: 24, purchase_price: "15,992", mrp: "17,911.38" },
//   { sku: "NCFD192", kit_name: "NEOMAG CELL FREE DNA EXTRACTION KIT", manufacturer: "Neom Scientific Private Limited", group_classification: "Extraction-Clinical", number_of_rxn: 192, purchase_price: "316,800", mrp: "354,816.00" },
//   { sku: "NCFD96", kit_name: "NEOMAG CELL FREE DNA EXTRACTION KIT", manufacturer: "Neom Scientific Private Limited", group_classification: "Extraction-Clinical", number_of_rxn: 96, purchase_price: "174,240", mrp: "195,148.80" },
//   { sku: "NCFD48", kit_name: "NEOMAG CELL FREE DNA EXTRACTION KIT", manufacturer: "Neom Scientific Private Limited", group_classification: "Extraction-Clinical", number_of_rxn: 48, purchase_price: "95,832", mrp: "107,331.84" },
//   { sku: "NCFD24", kit_name: "NEOMAG CELL FREE DNA EXTRACTION KIT", manufacturer: "Neom Scientific Private Limited", group_classification: "Extraction-Clinical", number_of_rxn: 24, purchase_price: "52,708", mrp: "59,032.51" },
//   { sku: "NeoBCT-100", kit_name: "Cell free DNA Blood Collection Tubes", manufacturer: "Neom Scientific Private Limited", group_classification: "Sample Collection", number_of_rxn: 100, purchase_price: "80,000", mrp: "89,600.00" },
//   { sku: "NeoBCT-50", kit_name: "Cell free DNA Blood Collection Tubes", manufacturer: "Neom Scientific Private Limited", group_classification: "Sample Collection", number_of_rxn: 50, purchase_price: "44,000", mrp: "49,280.00" },
//   { sku: "NeoBDPE-500 mL", kit_name: "NeoBead DNA Purification Kit-CE", manufacturer: "Neom Scientific Private Limited", group_classification: "Purification", number_of_rxn: 1000, purchase_price: "650000", mrp: "728,000.00" },
//   { sku: "NeoBDPN-60 mL", kit_name: "NeoBead DNA Purification Kit-NGS", manufacturer: "Neom Scientific Private Limited", group_classification: "Purification", number_of_rxn: 60, purchase_price: "155000", mrp: "173,600.00" },
//   { sku: "NeoBDPN-50 mL", kit_name: "NeoBead DNA Purification Kit-NGS", manufacturer: "Neom Scientific Private Limited", group_classification: "Purification", number_of_rxn: 50, purchase_price: "147250", mrp: "164,920.00" },
//   { sku: "NeoBDPN-20 mL", kit_name: "NeoBead DNA Purification Kit-NGS", manufacturer: "Neom Scientific Private Limited", group_classification: "Purification", number_of_rxn: 20, purchase_price: "77500", mrp: "86,800.00" },
//   { sku: "NDT 1000", kit_name: "NEO DYE terminator  KIT", manufacturer: "Neom Scientific Private Limited", group_classification: "Amplification-Clinical", number_of_rxn: 1000, purchase_price: "1400000", mrp: "1,568,000.00" },
//   { sku: "NDT 100", kit_name: "NEO DYE terminator  KIT", manufacturer: "Neom Scientific Private Limited", group_classification: "Amplification-Clinical", number_of_rxn: 100, purchase_price: "140000", mrp: "156,800.00" },
//   { sku: "NYD48", kit_name: "NEOTYPER Y chromosome microdeletion detection kit", manufacturer: "Neom Scientific Private Limited", group_classification: "Amplification-Clinical", number_of_rxn: 48, purchase_price: "165000", mrp: "184,800.00" },
//   { sku: "NFMR48", kit_name: "NEOTYPER FMR1 gene CGG repeat detection kit", manufacturer: "Neom Scientific Private Limited", group_classification: "Amplification-Clinical", number_of_rxn: 48, purchase_price: "245000", mrp: "274,400.00" },
//   { sku: "NSMN48", kit_name: "NEOTYPER SMN1/SMN2 Exon deletion detection kit", manufacturer: "Neom Scientific Private Limited", group_classification: "Amplification-Clinical", number_of_rxn: 48, purchase_price: "205000", mrp: "229,600.00" },
//   { sku: "NMCC24", kit_name: "NEOTYPER Maternal Cell Contamination Detection Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "Amplification-Clinical", number_of_rxn: 24, purchase_price: "105000", mrp: "117,600.00" },
//   { sku: "NCYP50", kit_name: "NEOTYPER CYP2C19/CYP2C9&VKORC1 Genotyping Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "Amplification-Clinical", number_of_rxn: 50, purchase_price: "105000", mrp: "117,600.00" },
//   { sku: "NSLCO48", kit_name: "NEOTYPER SLCO1B1 & ApoE & CYP2C19 Genotyping Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "Amplification-Clinical", number_of_rxn: 48, purchase_price: "155000", mrp: "173,600.00" },
//   { sku: "NTAK48", kit_name: "NEOTYPER Aneuploidy Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "Amplification-Clinical", number_of_rxn: 48, purchase_price: "212,259.00", mrp: "237,730.08" },
//   { sku: "NIPQ", kit_name: "Aneuploidy (T21, T18, T13 and Fetal fraction)", manufacturer: "Neom Scientific Private Limited", group_classification: "Amplification-Clinical", number_of_rxn: 100, purchase_price: "758,030.00", mrp: "848,993.60" },
//   { sku: "NIPQS", kit_name: "Aneuploidy (T21, T18, T13 and Fetal fraction + Sex Aneuploidies)", manufacturer: "Neom Scientific Private Limited", group_classification: "Amplification-Clinical", number_of_rxn: 100, purchase_price: "758,030.00", mrp: "848,993.60" },
//   { sku: "NIPT-FF-100", kit_name: "NIPT Fetal Fraction", manufacturer: "Neom Scientific Private Limited", group_classification: "Amplification-Clinical", number_of_rxn: 100, purchase_price: "293,930.00", mrp: "329,201.60" },
//   { sku: "NIPT-GS-100", kit_name: "Maternal Contamination", manufacturer: "Neom Scientific Private Limited", group_classification: "Amplification-Clinical", number_of_rxn: 100, purchase_price: "293,930.00", mrp: "329,201.60" },
//   { sku: "NALT384", kit_name: "NeoAmp Library Kit for semi-conductor technology", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 384, purchase_price: "2,850,000.00", mrp: "3,192,000.00" },
//   { sku: "NALI384", kit_name: "NeoAmp Library Kit for SBS technology", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 384, purchase_price: "2,975,000.00", mrp: "3,332,000.00" },
//   { sku: "NALU384", kit_name: "NeoAmp Library Kit-UNIVERSAL", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 384, purchase_price: "3,115,000.00", mrp: "3,488,800.00" },
//   { sku: "NBI1_96", kit_name: "NeoBarcode- Ilumina 1-96", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 96, purchase_price: "1,075,000.00", mrp: "1,204,000.00" },
//   { sku: "NBT1_96", kit_name: "NeoBarcode- Ion 1-96", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 96, purchase_price: "1,075,000.00", mrp: "1,204,000.00" },
//   { sku: "NHK96", kit_name: "NeoHyb Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 96, purchase_price: "875,000.00", mrp: "980,000.00" },
//   { sku: "NCC192", kit_name: "NeoComprehensive Cardio Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 192, purchase_price: "1,875,000.00", mrp: "2,100,000.00" },
//   { sku: "NCMS192", kit_name: "NeoComprehensive CMS Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 192, purchase_price: "2,500,000.00", mrp: "2,800,000.00" },
//   { sku: "NAD96", kit_name: "NeoComprehensive Autoimmune Disease Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 96, purchase_price: "1,175,000.00", mrp: "1,316,000.00" },
//   { sku: "NCM192", kit_name: "NeoComprehensive Cardio Myopathy Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 192, purchase_price: "1,875,000.00", mrp: "2,100,000.00" },
//   { sku: "NCM96", kit_name: "NeoCardio Myopathy Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 96, purchase_price: "1,175,000.00", mrp: "1,316,000.00" },
//   { sku: "NCH96", kit_name: "NeoCancer Hot Spot Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 96, purchase_price: "1,675,000.00", mrp: "1,876,000.00" },
//   { sku: "AM9600", kit_name: "NeoMyeloid Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 96, purchase_price: "1,250,228.00", mrp: "1,400,255.36" },
//   { sku: "NCE96v2", kit_name: "NeoClinical Exome Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 96, purchase_price: "1,371,300.00", mrp: "1,535,856.00" },
//   { sku: "NECN96v2", kit_name: "Neo_ExomeComp_NGS 96 v2", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 96, purchase_price: "1,405,000.00", mrp: "1,573,600.00" },
//   { sku: "NCS96v2", kit_name: "NeoCarrier Seq Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 96, purchase_price: "1,085,000.00", mrp: "1,215,200.00" },
//   { sku: "NFL96v2", kit_name: "NeoFrag Library Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 96, purchase_price: "645,000.00", mrp: "722,400.00" },
//   { sku: "NTU24", kit_name: "NeoTruncated Adapter", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 24, purchase_price: "135,000.00", mrp: "151,200.00" },
//   { sku: "NIPS_NGS100v2", kit_name: "NeoNIPS Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 100, purchase_price: "675,000.00", mrp: "756,000.00" },
//   { sku: "ExomeComp_NGS100v2", kit_name: "NeoEx v2 - Exome Comprehensive Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 100, purchase_price: "1,495,000.00", mrp: "1,674,400.00" },
//   { sku: "Carrier_NGS100 v2", kit_name: "NeoCarrier v2 Carrier Seq Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 100, purchase_price: "1,175,000.00", mrp: "1,316,000.00" },
//   { sku: "NeoClinical Ex v2", kit_name: "Neo Clinical Exome Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "NGS Technology", number_of_rxn: 100, purchase_price: "1,395,000.00", mrp: "1,562,400.00" },
//   { sku: "NeoBead NGS-50", kit_name: "NeoBead Purification Kit", manufacturer: "Neom Scientific Private Limited", group_classification: "Purification", number_of_rxn: 50, purchase_price: "147,250.00", mrp: "164,920.00" },
//   { sku: "NMCD192", kit_name: "NEO CELL FREE DNA EXTRACTION KIT", manufacturer: "Neom Scientific Private Limited", group_classification: "Extraction-Clinical", number_of_rxn: 192, purchase_price: "316,800", mrp: "354,816.00" },
//   { sku: "NCFT-50", kit_name: "Cell free DNA Blood Collection Tubes", manufacturer: "Neom Scientific Private Limited", group_classification: "Sample Collection", number_of_rxn: 50, purchase_price: "44,000", mrp: "49,280.00" },
// ];

const inventoryItems = [];

const Inventory = () => {
  const [fetchedItems, setFetchedItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [user, setUser] = useState([]);

  useEffect(() => {
    const cookieData = Cookies.get('vide_user');
    if (cookieData) {
      const parsedData = JSON.parse(cookieData);
      setUser(parsedData);
      fetchInventoryItems(parsedData.hospital_name);
    }
  }, []);

  const handleRowClick = (item) => {
    setEditItem(item);
    setEditDialogOpen(true);
  };

  const handleEditSave = async (updatedItem) => {
    try {
      console.log('updatedItem:', updatedItem);
      const response = await axios.put('/api/inventory', updatedItem);
      if (response.data[0].status === 200) {
        toast.success('Item updated successfully!');
        setEditDialogOpen(false);
        setEditItem(null);
        fetchInventoryItems(user.hospital_name);
      } else {
        toast.error(response.data[0].message);
      }
    } catch (error) {
      toast.error('Error updating item');
    }
  };

  const fetchInventoryItems = async (hospital_name) => {
    try {
      const response = await axios.get(`/api/inventory?hospital_name=${hospital_name}`);
      if (response.data[0].status === 200) {
        setFetchedItems(response.data[0].data);
      } else if (response.data[0].status === 400) {
        toast.error(response.data[0].message);
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  const allItems = [...inventoryItems, ...fetchedItems];

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.kit_name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className='p-4'>
      <div className='flex items-center gap-2 mb-4 p-2 border-2 rounded-lg bg-white max-w-xl'>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type='text'
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder='Search items by Kit Name or SKU...'
            className='pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300'
            style={{ minWidth: 250 }}
          />
        </div>
      </div>
      <div>
        <Button
          className='my-3 p-2 bg-orange-400 hover:bg-orange-400 hover:text-white cursor-pointer text-white rounded'
          onClick={() => setOpenDialog(true)}
        >
          Add New Item +
        </Button>
      </div>
      <div>
        <h2 className='text-xl font-semibold mb-4'>Inventory Items</h2>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-6 overflow-x-auto w-full whitespace-nowrap"
          style={{ maxWidth: 'calc(100vw - 60px)' }}>
          <div className="max-h-[70vh] overflow-y-auto w-full">
            <table className="min-w-full border-collapse table-auto">
              <thead className="bg-orange-100 dark:bg-gray-800 sticky top-0 z-10">
                <tr className='bg-gray-100'>
                  <th className="px-4 py-2 text-left">Serial No.</th>
                  <th className="px-4 py-2 text-left">SKU</th>
                  <th className='px-4 py-2 text-left'>Kit Name</th>
                  <th className='px-4 py-2 text-left'>Manufacturer</th>
                  <th className='px-4 py-2 text-left'>No of Rxn</th>
                  <th className="px-4 py-2 text-left">Purchase Price</th>
                  <th className="px-4 py-2 text-left">CPR</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr key={idx} className="cursor-pointer hover:bg-orange-50"
                    onClick={() => handleRowClick(item)}>
                    <td className='px-4 py-2'>
                      <abbr title="Click to edit details" style={{ textDecoration: 'underline' }}>
                        {idx + 1}
                      </abbr>
                    </td>
                    <td className='px-4 py-2'>{item.sku}</td>
                    <td className='px-4 py-2'>{item.kit_name}</td>
                    <td className='px-4 py-2'>{item.manufacturer}</td>
                    <td className='px-4 py-2'>{item.number_of_rxn}</td>
                    <td className="px-4 py-2">
                      {item.purchase_price
                        ? Number(item.purchase_price.toString().replace(/,/g, '')).toLocaleString('en-IN')
                        : ''}
                    </td>
                    <td className="px-4 py-2"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddNewItemDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        hospital_name={user.hospital_name}
        fetchInventoryItems={fetchInventoryItems}
      />
      <EditItemDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        item={editItem}
        onSave={handleEditSave}
      />
      <ToastContainer />
    </div>
  );
};

export default Inventory;

const AddNewItemDialog = ({ open, onClose, hospital_name, fetchInventoryItems }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.hospital_name = hospital_name;
    try {
      const response = await axios.post('/api/inventory', data)
      if (response.data[0].status === 200) {
        toast.success('New item added successfully!');
        onClose();
        fetchInventoryItems(hospital_name); // <-- fetch updated items here
      }
      else if (response.data[0].status === 400) {
        toast.error(response.data[0].message);
      }
    }
    catch (error) {
      console.error('Error adding new item:', error);
      onClose();
    }
  }
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add New Inventory Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">SKU</label>
              <input
                type="text"
                name="sku"
                className="mt-1 p-2 block w-full border-2 border-orange-300 rounded-md shadow-sm" placeholder="Enter SKU" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kit Name</label>
              <input
                type="text"
                name="kit_name"
                className="mt-1 p-2 block w-full border-2 border-orange-300 rounded-md shadow-sm"
                placeholder="Enter Kit Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
              <input
                type="text"
                name="manufacturer"
                className="mt-1 p-2 block w-full border-2 border-orange-300 rounded-md shadow-sm" placeholder="Enter Manufacturer" />
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Group Classification</label>
              <input
                type="text"
                name="group_classification"
                className="mt-1 p-2 block w-full border-2 border-orange-300 rounded-md shadow-sm"
                placeholder="Enter Group Classification" />
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-700">No of Rxn</label>
              <input
                type="number"
                min={0}
                name="number_of_rxn"
                className="mt-1 p-2 block w-full border-2 border-orange-300 rounded-md shadow-sm" placeholder="Enter No of Rxn" />
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">List Price</label>
              <input
                type="text"
                name="list_price"
                className="mt-1 p-2 block w-full border-2 border-orange-300 rounded-md shadow-sm" placeholder="Enter List Price" />
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
              <input
                type="text"
                name="purchase_price"
                className="mt-1 p-2 block w-full border-2 border-orange-300 rounded-md shadow-sm" placeholder="Enter Purchase Price" />
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">MRP Sale (Inc GST)</label>
              <input
                type="text"
                name="mrp"
                className="mt-1 p-2 block w-full border-2 border-orange-300 rounded-md shadow-sm"
                placeholder="Enter MRP Sale (Inc GST)" />
            </div> */}
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                Save Item
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const EditItemDialog = ({ open, onClose, item, onSave }) => {
  const [form, setForm] = useState(item || {});

  useEffect(() => {
    setForm(item || {});
  }, [item]);

  if (!item) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Inventory Item</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input
              type="text"
              name="sku"
              value={form.sku || ''}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border-2 border-orange-300 rounded-md shadow-sm"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Kit Name</label>
            <input
              type="text"
              name="kit_name"
              value={form.kit_name || ''}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border-2 border-orange-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
            <input
              type="text"
              name="manufacturer"
              value={form.manufacturer || ''}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border-2 border-orange-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">No of Rxn</label>
            <input
              type="number"
              name="number_of_rxn"
              value={form.number_of_rxn || ''}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border-2 border-orange-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
            <input
              type="text"
              name="purchase_price"
              value={form.purchase_price || ''}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border-2 border-orange-300 rounded-md shadow-sm"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};