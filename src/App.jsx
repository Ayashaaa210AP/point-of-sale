import { useMemo, useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Toast,
  ToastContainer,
} from 'react-bootstrap';

export default function App() {
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(''); // Harga
  const [category, setCategory] = useState(''); // Kategori
  const [releaseDate, setReleaseDate] = useState(''); // Tanggal Rilis
  const [stock, setStock] = useState(''); // Stok
  const [isActive, setIsActive] = useState(true); // Produk Aktif
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // --- KATEGORI UNTUK SELECT ---
  const categories = [
    { value: 'elektronik', label: 'Elektronik' },
    { value: 'pakaian', label: 'Pakaian' },
    { value: 'makanan', label: 'Makanan' },
  ];

  // --- LOAD DATA DARI LOCALSTORAGE SAAT PERTAMA KALI ---
  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        setProducts(parsed);
      } catch (e) {
        console.error('Gagal memuat data dari localStorage:', e);
        setProducts([]);
      }
    } else {
      // Jika belum ada, buat data awal
      const initialData = [
        {
          id: 1,
          name: 'Makanan',
          description: 'Produk makanan siap saji',
          price: 15000,
          category: 'makanan',
          releaseDate: '2025-01-01',
          stock: 100,
          isActive: true,
        },
        {
          id: 2,
          name: 'Minuman',
          description: 'Aneka minuman dingin & hangat',
          price: 8000,
          category: 'makanan',
          releaseDate: '2025-01-02',
          stock: 200,
          isActive: true,
        },
      ];
      setProducts(initialData);
      localStorage.setItem('products', JSON.stringify(initialData));
    }
  }, []);

  // --- SIMPAN KE LOCALSTORAGE SETIAP KALI PRODUK BERUBAH ---
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  // --- VALIDASI ---
  const validate = () => {
    const newErrors = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Nama Produk wajib diisi.';
    } else if (trimmedName.length < 3) {
      newErrors.name = 'Minimal 3 karakter.';
    } else if (trimmedName.length > 50) {
      newErrors.name = 'Maksimal 50 karakter.';
    } else {
      const isDuplicate = products.some(
        c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== editingId
      );
      if (isDuplicate) {
        newErrors.name = 'Nama Produk sudah ada.';
      }
    }

    if (description.length > 200) {
      newErrors.description = 'Deskripsi maksimal 200 karakter.';
    }

    if (price === '') {
      newErrors.price = 'Harga wajib diisi.';
    } else if (isNaN(price) || parseFloat(price) <= 0) {
      newErrors.price = 'Harga harus angka positif.';
    }

    if (!category) {
      newErrors.category = 'Kategori wajib dipilih.';
    }

    if (!releaseDate) {
      newErrors.releaseDate = 'Tanggal rilis wajib diisi.';
    } else {
      const date = new Date(releaseDate);
      const today = new Date();
      if (date > today) {
        newErrors.releaseDate = 'Tanggal rilis tidak boleh melebihi hari ini.';
      }
    }

    if (stock === '') {
      newErrors.stock = 'Stok wajib diisi.';
    } else if (isNaN(stock) || parseInt(stock) < 0) {
      newErrors.stock = 'Stok harus angka non-negatif.';
    }

    return newErrors;
  };

  // --- RESET FORM ---
  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setReleaseDate('');
    setStock('');
    setIsActive(true);
    setErrors({});
    setEditingId(null);
  };

  // --- TOAST ---
  const showToastMsg = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  // --- SUBMIT ---
  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);

    if (Object.keys(v).length > 0) {
      showToastMsg('Periksa kembali input Anda.', 'danger');
      return;
    }

    const productData = {
      id: editingId ? editingId : Date.now(),
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      releaseDate,
      stock: parseInt(stock),
      isActive,
    };

    if (editingId === null) {
      setProducts(prev => [productData, ...prev]);
      showToastMsg('Produk berhasil ditambahkan.', 'success');
    } else {
      setProducts(prev =>
        prev.map(p => (p.id === editingId ? productData : p))
      );
      showToastMsg('Produk berhasil diperbarui.', 'success');
    }

    resetForm();
  };

  // --- EDIT ---
  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setPrice(cat.price || '');
    setCategory(cat.category || '');
    setReleaseDate(cat.releaseDate || '');
    setStock(cat.stock || '');
    setIsActive(cat.isActive || true);
    setErrors({});
  };

  // --- DELETE ---
  const handleDelete = (id) => {
    const target = products.find(c => c.id === id);
    if (!target) return;

    const ok = window.confirm(`Hapus Produk "${target.name}"?`);
    if (!ok) return;

    setProducts(prev => prev.filter(c => c.id !== id));
    if (editingId === id) resetForm();
    showToastMsg('Produk berhasil dihapus.', 'success');
  };

  const descriptionCount = `${description.length}/200`;
  const isEditing = editingId !== null;

  return (
    <Container className="py-4">
      <Row>
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header as="h5">
              {isEditing ? 'Edit Produk' : 'Tambah Produk'}
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3" controlId="categoryName">
                  <Form.Label>Nama Produk</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Contoh: Sembako"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    isInvalid={!!errors.name}
                    maxLength={50}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="categoryDescription">
                  <Form.Label>Deskripsi (opsional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Tulis deskripsi Produk (maks. 200 karakter)"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                    }}
                    isInvalid={!!errors.description}
                    maxLength={200}
                  />
                  <div className="d-flex justify-content-between">
                    <Form.Text muted>Berikan deskripsi singkat Produk.</Form.Text>
                    <Form.Text muted>{descriptionCount}</Form.Text>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Harga */}
                <Form.Group className="mb-3" controlId="price">
                  <Form.Label>Harga</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Misal: 15000"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (errors.price) setErrors(prev => ({ ...prev, price: undefined }));
                    }}
                    isInvalid={!!errors.price}
                    min={0}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.price}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Kategori */}
                <Form.Group className="mb-3" controlId="category">
                  <Form.Label>Kategori</Form.Label>
                  <Form.Select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (errors.category) setErrors(prev => ({ ...prev, category: undefined }));
                    }}
                    isInvalid={!!errors.category}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.category}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Tanggal Rilis */}
                <Form.Group className="mb-3" controlId="releaseDate">
                  <Form.Label>Tanggal Rilis</Form.Label>
                  <Form.Control
                    type="date"
                    value={releaseDate}
                    onChange={(e) => {
                      setReleaseDate(e.target.value);
                      if (errors.releaseDate) setErrors(prev => ({ ...prev, releaseDate: undefined }));
                    }}
                    isInvalid={!!errors.releaseDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.releaseDate}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Stok */}
                <Form.Group className="mb-3" controlId="stock">
                  <Form.Label>Stok</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Misal: 50"
                    value={stock}
                    onChange={(e) => {
                      setStock(e.target.value);
                      if (errors.stock) setErrors(prev => ({ ...prev, stock: undefined }));
                    }}
                    isInvalid={!!errors.stock}
                    min={0}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.stock}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Produk Aktif */}
                <Form.Group className="mb-3" controlId="isActive">
                  <Form.Check
                    type="switch"
                    label="Produk Aktif"
                    checked={isActive}
                    onChange={() => setIsActive(!isActive)}
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button type="submit" variant={isEditing ? 'primary' : 'success'}>
                    {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="secondary" onClick={resetForm}>
                      Batal
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card>
            <Card.Header as="h5">Daftar Produk</Card.Header>
            <Card.Body className="p-0">
              <Table striped bordered hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 60 }} className="text-center">#</th>
                    <th>Nama</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Stok</th>
                    <th>Aktif</th>
                    <th style={{ width: 180 }} className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-muted">
                        Belum ada data Produk.
                      </td>
                    </tr>
                  ) : (
                    products.map((product, idx) => (
                      <tr key={product.id}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{product.name}</td>
                        <td>{categories.find(c => c.value === product.category)?.label || '-'}</td>
                        <td>Rp {product.price.toLocaleString()}</td>
                        <td>{product.stock}</td>
                        <td className="text-center">
                          {product.isActive ? (
                            <span className="badge bg-success">Ya</span>
                          ) : (
                            <span className="badge bg-secondary">Tidak</span>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => handleEdit(product)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(product.id)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">Notifikasi</strong>
            <small>Baru saja</small>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'danger' ? 'text-white' : ''}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}