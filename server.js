const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const { body, validationResult, check } = require("express-validator");
const {
  loadContact,
  findContact,
  addContact,
  cekDuplikat,
  deleteContact,
  updateContacts,
} = require("./utils/contacts");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(expressLayouts); //third party middleware
app.use(express.static("public")); //built-in middleware
app.use(express.urlencoded({ extended: true })); //built-in middleware

//konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.get("/", (req, res) => {
  res.status(200);
  const mahasiswa = [
    {
      nama: "Haiqel",
      email: "ikel@gmail.com",
    },
    {
      nama: "Abel",
      email: "masabel@gmail.com",
    },
  ];

  res.render("index", {
    nama: "Haiqel",
    title: "Halaman Index",
    mahasiswa: mahasiswa,
    layout: "layout/main-layout",
  });
  // res.sendFile('./index.html',{root: __dirname})
});

app.get("/about", (req, res) => {
  res.status(200);
  res.render("about", {
    title: "Halaman About",
    layout: "layout/main-layout",
  });
  // res.sendFile('./about.html',{root: __dirname})
});

app.get("/contact", (req, res) => {
  const contacts = loadContact();
  res.render("contact", {
    title: "Halaman Contact",
    layout: "layout/main-layout",
    contacts,
    msg: req.flash("msg"),
  });
  // res.sendFile('./contact.html',{root: __dirname})
});

//halaman form tambah data kontak
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form Tambah Data Contact",
    layout: "layout/main-layout",
  });
});

//proses data kontak
app.post(
  "/contact",
  [
    body("nama").custom((value, { req }) => {
      const duplikat = cekDuplikat(value);
      if (duplikat) {
        throw new Error("Contact sudah terdaftar!");
      }
      return true;
    }),
    check("email", "Email tidak valid").isEmail(),
    check("nomor", "Nomor tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //   return res.status(400).json({ errors: errors.array() });
      return res.render("add-contact", {
        title: "Form Tambah Data Contact",
        layout: "layout/main-layout",
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      //kirimkan flash message
      req.flash("msg", "Data kontak berhasil ditambahkan!");
      res.redirect("/contact");
    }
  }
);

//proses delete kontak
app.get("/contact/delete/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  //jika kontak tidak ada
  if (!contact) {
    res.status(404);
    res.send("<h1>404</h1>");
  } else {
    deleteContact(req.params.nama);
    req.flash("msg", "Data kontak berhasil dihapus!");
    res.redirect("/contact");
  }
});

//form ubah data kontak
app.get("/contact/edit/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  res.render("edit-contact", {
    title: "Form Ubah Data Contact",
    layout: "layout/main-layout",
    contact,
  })
})

//proses ubah data
app.post(
  "/contact/update",
  [
    body("nama").custom((value, { req }) => {
      const duplikat = cekDuplikat(value);
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Contact sudah terdaftar!");
      }
      return true;
    }),
    check("email", "Email tidak valid").isEmail(),
    check("nomor", "Nomor tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //   return res.status(400).json({ errors: errors.array() });
      return res.render("edit-contact", {
        title: "Form Ubah Data Contact",
        layout: "layout/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      updateContacts(req.body);
      //kirimkan flash message
      req.flash("msg", "Data kontak berhasil diubah!");
      res.redirect("/contact");
    }
  }
);

//halaman detail kontak
app.get("/contact/:nama", (req, res) => {
  const contact = findContact(req.params.nama);

  res.render("detail", {
    title: "Halaman Detail Contact",
    layout: "layout/main-layout",
    contact,
  });
  // res.sendFile('./contact.html',{root: __dirname})
});

app.use("/", (req, res) => {
  res.status(404);
  res.send("<h1>Halaman tidak ditemukan!</h1>");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
