/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Loans } from './pages/Loans';
import { Collections } from './pages/Collections';
import { Calculators } from './pages/Calculators';
import { Placeholder } from './pages/Placeholder';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/agents" element={<Placeholder title="Agents" />} />
            <Route path="/accounts" element={<Placeholder title="Accounts" />} />
            <Route path="/reports" element={<Placeholder title="Reports" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

