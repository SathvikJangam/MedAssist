import Invoice from '../models/Invoice.js';

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('patientId', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create({
      ...req.body,
      issuedBy: req.user._id
    });
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const payInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id, 
      { status: 'Paid', paidAt: Date.now() }, 
      { new: true }
    ).populate('patientId', 'name');
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};