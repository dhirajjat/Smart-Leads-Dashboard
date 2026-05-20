import { Request, Response } from 'express';
import { db } from '../db.ts';

export const getLeads = async (req: Request, res: Response) => {
  try {
    const { status, source, search, sortBy, page = 1, limit = 10 } = req.query;
    let leads = [...await db.getLeads()];

    // 1. Filtering
    if (status) {
      leads = leads.filter(l => l.status === status);
    }
    if (source) {
      leads = leads.filter(l => l.source === source);
    }

    // 2. Search
    if (search) {
      const searchLower = (search as string).toLowerCase();
      leads = leads.filter(l => 
        l.name.toLowerCase().includes(searchLower) || 
        l.email.toLowerCase().includes(searchLower)
      );
    }

    // 3. Sorting
    leads.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    // 4. Pagination
    const total = leads.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedLeads = leads.slice(startIndex, startIndex + Number(limit));

    res.json({
      leads: paginatedLeads,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leads' });
  }
};

export const createLead = (req: Request, res: Response) => {
  const { name, email, status, source } = req.body;
  if (!name || !email || !source) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const newLead = db.addLead({ name, email, status: status || 'New', source });
  res.status(201).json(newLead);
};

export const updateLeadStatus = (req: any, res: Response) => {
  const { id } = req.params;
  const userRole = req.user?.role;
  const { name, email, source, status } = req.body;

  if (userRole === 'admin') {
    const updated = db.updateLead(id, { name, email, source, status });
    if (!updated) return res.status(404).json({ message: 'Lead not found' });
    return res.json(updated);
  } else {
    // Sales can only update status
    if (name || email || source) {
      return res.status(403).json({ message: 'Only admin can modify lead details' });
    }
    const updated = db.updateLead(id, { status });
    if (!updated) return res.status(404).json({ message: 'Lead not found' });
    return res.json(updated);
  }
};

export const deleteLead = (req: Request, res: Response) => {
  const { id } = req.params;
  db.deleteLead(id);
  res.json({ message: 'Lead deleted' });
};

export const getStats = async (req: Request, res: Response) => {
  const leads = await db.getLeads();
  const stats = {
    total: (await leads).length,
    new: (await leads).filter(l => l.status === 'New').length,
    contacted: (await leads).filter(l => l.status === 'Contacted').length,
    qualified: (await leads).filter(l => l.status === 'Qualified').length,
    lost: (await leads).filter(l => l.status === 'Lost').length,
    sources: {
      website: (await leads).filter(l => l.source === 'Website').length,
      instagram: (await leads).filter(l => l.source === 'Instagram').length,
      referral: (await leads).filter(l => l.source === 'Referral').length,
    }
  };
  res.json(stats);
};
